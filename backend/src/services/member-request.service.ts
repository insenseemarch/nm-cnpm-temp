import prisma from '../utils/prisma';
import { MemberRequestType, RequestStatus } from '@prisma/client';
import notificationService from './notification.service';

export class MemberRequestService {
    /**
     * Create a member request (ADD/EDIT/DELETE)
     */
    async createMemberRequest(
        familyId: string,
        userId: string,
        data: {
            type: MemberRequestType;
            memberData?: any; // For ADD/EDIT
            targetMemberId?: string; // For EDIT/DELETE
            message?: string;
        }
    ) {
        // Check if user is member of family
        const family = await prisma.family.findFirst({
            where: {
                id: familyId,
                OR: [
                    { adminId: userId },
                    { users: { some: { id: userId } } }
                ]
            }
        });

        if (!family) {
            throw new Error('Family not found or you are not a member');
        }

        // Validate based on type
        if (data.type === 'ADD_MEMBER') {
            if (!data.memberData) {
                throw new Error('Member data is required for ADD_MEMBER request');
            }
            // Validate required fields
            if (!data.memberData.name || !data.memberData.gender || data.memberData.generation === undefined) {
                throw new Error('Name, gender, and generation are required');
            }
        }

        if (data.type === 'EDIT_MEMBER' || data.type === 'DELETE_MEMBER') {
            if (!data.targetMemberId) {
                throw new Error('Target member ID is required for EDIT/DELETE request');
            }

            // Validate target member exists
            const targetMember = await prisma.familyMember.findFirst({
                where: {
                    id: data.targetMemberId,
                    familyId,
                    isDeleted: false
                }
            });

            if (!targetMember) {
                throw new Error('Target member not found');
            }

            if (data.type === 'EDIT_MEMBER' && !data.memberData) {
                throw new Error('Member data is required for EDIT_MEMBER request');
            }
        }

        // Create request
        const request = await prisma.memberRequest.create({
            data: {
                familyId,
                requesterId: userId,
                type: data.type,
                memberData: data.memberData || {},
                targetMemberId: data.targetMemberId || null,
                message: data.message || null,
                status: 'PENDING'
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // Generate notification title and message based on request type
        const requestTypeName = data.type === 'ADD_MEMBER' ? 'thêm' : data.type === 'EDIT_MEMBER' ? 'chỉnh sửa' : 'xóa';
        const memberName = data.memberData?.name || 'thành viên';

        // Send notification to family admin
        try {
            await notificationService.createNotification({
                userId: family.adminId,
                senderId: userId,
                familyId,
                type: 'MEMBER_REQUEST',
                title: `Yêu cầu ${requestTypeName} thành viên`,
                message: `${request.requester.name} đã gửi yêu cầu ${requestTypeName} thành viên ${memberName}`,
                data: {
                    requestId: request.id,
                    requestType: data.type,
                    personName: memberName,
                    targetMemberId: data.targetMemberId,
                },
            });
        } catch (error) {
            console.error('Failed to create MEMBER_REQUEST notification:', error);
        }

        return request;
    }

    /**
     * Get all member requests for a family (admin only)
     */
    async getFamilyMemberRequests(
        familyId: string,
        userId: string,
        status?: RequestStatus
    ) {
        // Check if user is admin
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            select: { adminId: true }
        });

        if (!family) {
            throw new Error('Family not found');
        }

        if (family.adminId !== userId) {
            throw new Error('Only admin can view member requests');
        }

        // Get requests
        const requests = await prisma.memberRequest.findMany({
            where: {
                familyId,
                ...(status && { status })
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return requests;
    }

    /**
     * Approve or reject member request (admin only)
     */
    async handleMemberRequest(
        familyId: string,
        requestId: string,
        adminId: string,
        action: 'APPROVE' | 'REJECT'
    ) {
        // Check if user is admin
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            select: { adminId: true }
        });

        if (!family) {
            throw new Error('Family not found');
        }

        if (family.adminId !== adminId) {
            throw new Error('Only admin can approve/reject member requests');
        }

        // Get request
        const request = await prisma.memberRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error('Member request not found');
        }

        if (request.familyId !== familyId) {
            throw new Error('Request does not belong to this family');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Request has already been processed');
        }

        if (action === 'REJECT') {
            // Simple reject
            await prisma.memberRequest.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED'
                }
            });

            // Get member name for notification
            let memberName = 'thành viên';
            const memberData = request.memberData as any;
            if (request.targetMemberId) {
                const targetMember = await prisma.familyMember.findUnique({
                    where: { id: request.targetMemberId },
                    select: { name: true }
                });
                memberName = targetMember?.name || memberName;
            } else if (memberData?.name) {
                memberName = memberData.name;
            }
            const requestTypeName = request.type === 'ADD_MEMBER' ? 'thêm' : request.type === 'EDIT_MEMBER' ? 'chỉnh sửa' : 'xóa';

            // Send MEMBER_REJECTED notification to requester
            try {
                await notificationService.createNotification({
                    userId: request.requesterId,
                    senderId: adminId,
                    familyId,
                    type: 'MEMBER_REJECTED',
                    title: 'Yêu cầu thành viên bị từ chối',
                    message: `Yêu cầu ${requestTypeName} thành viên "${memberName}" đã bị từ chối`,
                    data: {
                        requestId: request.id,
                        requestType: request.type,
                        personName: memberName,
                        targetMemberId: request.targetMemberId,
                    },
                });
            } catch (error) {
                console.error('Failed to create MEMBER_REJECTED notification:', error);
            }

            return {
                message: 'Member request rejected'
            };
        }

        // APPROVE - Execute based on type
        if (request.type === 'ADD_MEMBER') {
            // Create new member
            const memberData = request.memberData as any;

            // Check if requester wants to link (isMe)
            let linkedUserId = null;
            let isVerified = false;

            if (memberData.isMe) {
                // Validate requester not already linked
                const existingLink = await prisma.familyMember.findFirst({
                    where: {
                        familyId,
                        linkedUserId: request.requesterId,
                        isDeleted: false
                    }
                });

                if (existingLink) {
                    throw new Error('Requester is already linked to another member in this family');
                }

                linkedUserId = request.requesterId;
                isVerified = true;
            }

            await prisma.$transaction([
                prisma.familyMember.create({
                    data: {
                        familyId,
                        name: memberData.name,
                        gender: memberData.gender,
                        generation: memberData.generation,
                        email: memberData.email || null,
                        birthDate: memberData.birthDate ? new Date(memberData.birthDate) : null,
                        occupation: memberData.occupation || null,
                        customOccupation: memberData.customOccupation || null,
                        hometown: memberData.hometown || null,
                        currentAddress: memberData.currentAddress || null,
                        maritalStatus: memberData.maritalStatus || 'SINGLE',
                        marriageDate: memberData.marriageDate ? new Date(memberData.marriageDate) : null,
                        avatar: memberData.avatar || null,
                        bio: memberData.bio || null,
                        fatherId: memberData.fatherId || null,
                        motherId: memberData.motherId || null,
                        spouseId: memberData.spouseId || null,
                        // Link to requester if isMe is true
                        linkedUserId: linkedUserId,
                        isVerified: isVerified
                    }
                }),
                prisma.memberRequest.update({
                    where: { id: requestId },
                    data: { status: 'APPROVED' }
                })
            ]);

            // Send MEMBER_APPROVED notification to requester
            try {
                await notificationService.createNotification({
                    userId: request.requesterId,
                    senderId: adminId,
                    familyId,
                    type: 'MEMBER_APPROVED',
                    title: 'Yêu cầu thêm thành viên được chấp nhận',
                    message: `Yêu cầu thêm thành viên "${memberData.name}" đã được chấp nhận`,
                    data: {
                        requestId: request.id,
                        requestType: 'ADD_MEMBER',
                        personName: memberData.name,
                    },
                });
            } catch (error) {
                console.error('Failed to create MEMBER_APPROVED notification:', error);
            }

            return {
                message: 'Member created successfully'
            };

        } else if (request.type === 'EDIT_MEMBER') {
            // Update existing member
            if (!request.targetMemberId) {
                throw new Error('Target member ID is missing');
            }

            const memberData = request.memberData as any;

            await prisma.$transaction([
                prisma.familyMember.update({
                    where: { id: request.targetMemberId },
                    data: {
                        name: memberData.name,
                        email: memberData.email || null,
                        gender: memberData.gender,
                        birthDate: memberData.birthDate ? new Date(memberData.birthDate) : null,
                        occupation: memberData.occupation || null,
                        customOccupation: memberData.customOccupation || null,
                        hometown: memberData.hometown || null,
                        currentAddress: memberData.currentAddress || null,
                        maritalStatus: memberData.maritalStatus || 'SINGLE',
                        marriageDate: memberData.marriageDate ? new Date(memberData.marriageDate) : null,
                        avatar: memberData.avatar || null,
                        bio: memberData.bio || null,
                        fatherId: memberData.fatherId || null,
                        motherId: memberData.motherId || null,
                        spouseId: memberData.spouseId || null
                    }
                }),
                prisma.memberRequest.update({
                    where: { id: requestId },
                    data: { status: 'APPROVED' }
                })
            ]);

            // Send MEMBER_APPROVED notification to requester
            try {
                await notificationService.createNotification({
                    userId: request.requesterId,
                    senderId: adminId,
                    familyId,
                    type: 'MEMBER_APPROVED',
                    title: 'Yêu cầu chỉnh sửa thành viên được chấp nhận',
                    message: `Yêu cầu chỉnh sửa thông tin thành viên "${memberData.name}" đã được chấp nhận`,
                    data: {
                        requestId: request.id,
                        requestType: 'EDIT_MEMBER',
                        personName: memberData.name,
                        targetMemberId: request.targetMemberId,
                    },
                });
            } catch (error) {
                console.error('Failed to create MEMBER_APPROVED notification:', error);
            }

            return {
                message: 'Member updated successfully'
            };

        } else if (request.type === 'DELETE_MEMBER') {
            // Soft delete member
            if (!request.targetMemberId) {
                throw new Error('Target member ID is missing');
            }

            await prisma.$transaction([
                prisma.familyMember.update({
                    where: { id: request.targetMemberId },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        deletedBy: adminId
                    }
                }),
                prisma.memberRequest.update({
                    where: { id: requestId },
                    data: { status: 'APPROVED' }
                })
            ]);

            // Get deleted member name for notification
            const deletedMember = await prisma.familyMember.findUnique({
                where: { id: request.targetMemberId },
                select: { name: true }
            });

            // Send MEMBER_APPROVED notification to requester
            try {
                await notificationService.createNotification({
                    userId: request.requesterId,
                    senderId: adminId,
                    familyId,
                    type: 'MEMBER_APPROVED',
                    title: 'Yêu cầu xóa thành viên được chấp nhận',
                    message: `Yêu cầu xóa thành viên "${deletedMember?.name || 'thành viên'}" đã được chấp nhận`,
                    data: {
                        requestId: request.id,
                        requestType: 'DELETE_MEMBER',
                        personName: deletedMember?.name,
                        targetMemberId: request.targetMemberId,
                    },
                });
            } catch (error) {
                console.error('Failed to create MEMBER_APPROVED notification:', error);
            }

            return {
                message: 'Member deleted successfully'
            };
        }

        throw new Error('Invalid request type');
    }
}
