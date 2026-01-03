import { Request, Response } from 'express';
import { MemberRequestService } from '../services/member-request.service';

const memberRequestService = new MemberRequestService();

export class MemberRequestController {
    /**
     * POST /api/families/:id/member-requests
     * Create a member request (ADD/EDIT/DELETE)
     */
    async createMemberRequest(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { type, memberData, targetMemberId, message } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            if (!type || !['ADD_MEMBER', 'EDIT_MEMBER', 'DELETE_MEMBER'].includes(type)) {
                return res.status(400).json({
                    error: 'Type must be ADD_MEMBER, EDIT_MEMBER, or DELETE_MEMBER'
                });
            }

            const request = await memberRequestService.createMemberRequest(
                id,
                req.user.id,
                {
                    type,
                    memberData,
                    targetMemberId,
                    message
                }
            );

            return res.status(201).json({
                message: 'Member request created successfully',
                data: request
            });
        } catch (error: any) {
            console.error('Create member request error:', error);

            if (error.message.includes('not found') || error.message.includes('not a member')) {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('required')) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to create member request'
            });
        }
    }

    /**
     * GET /api/families/:id/member-requests
     * Get all member requests for a family (admin only)
     */
    async getMemberRequests(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { status } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const requests = await memberRequestService.getFamilyMemberRequests(
                id,
                req.user.id,
                status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
            );

            return res.status(200).json({
                data: requests
            });
        } catch (error: any) {
            console.error('Get member requests error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message === 'Only admin can view member requests') {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get member requests'
            });
        }
    }

    /**
     * PUT /api/families/:id/member-requests/:requestId
     * Approve or reject member request (admin only)
     */
    async handleMemberRequest(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, requestId } = req.params;
            const { action } = req.body;

            if (!id || !requestId) {
                return res.status(400).json({
                    error: 'Family ID and Request ID are required'
                });
            }

            if (!action || !['APPROVE', 'REJECT'].includes(action)) {
                return res.status(400).json({
                    error: 'Action must be APPROVE or REJECT'
                });
            }

            const result = await memberRequestService.handleMemberRequest(
                id,
                requestId,
                req.user.id,
                action
            );

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Handle member request error:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Only admin')) {
                return res.status(403).json({ error: error.message });
            }

            if (error.message.includes('already been processed')) {
                return res.status(409).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to handle member request'
            });
        }
    }
}
