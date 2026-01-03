import { Request, Response } from 'express';
import { FamilyService } from '../services/family.service';

const familyService = new FamilyService();

export class FamilyController {
    /**
     * POST /api/families
     * Create a new family
     */
    async createFamily(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { name, description } = req.body;

            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    error: 'Family name is required'
                });
            }

            const family = await familyService.createFamily(req.user.id, {
                name: name.trim(),
                description: description?.trim()
            });

            return res.status(201).json({
                message: 'Family created successfully',
                data: family
            });
        } catch (error: any) {
            console.error('Create family error:', error);
            return res.status(400).json({
                error: error.message || 'Failed to create family'
            });
        }
    }

    /**
     * GET /api/families
     * Get all families where user is admin or member
     */
    async getUserFamilies(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const families = await familyService.getUserFamilies(req.user.id);

            return res.status(200).json({
                data: families
            });
        } catch (error: any) {
            console.error('Get families error:', error);
            return res.status(400).json({
                error: error.message || 'Failed to get families'
            });
        }
    }

    /**
     * GET /api/families/:id
     * Get family details by ID
     */
    async getFamilyById(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const family = await familyService.getFamilyById(id, req.user.id);

            return res.status(200).json({
                data: family
            });
        } catch (error: any) {
            console.error('Get family error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message === 'You do not have access to this family') {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get family'
            });
        }
    }

    /**
     * PUT /api/families/:id
     * Update family information (admin only)
     */
    async updateFamily(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { name, description } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const family = await familyService.updateFamily(id, req.user.id, {
                name: name?.trim(),
                description: description?.trim()
            });

            return res.status(200).json({
                message: 'Family updated successfully',
                data: family
            });
        } catch (error: any) {
            console.error('Update family error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message === 'Only admin can update family information') {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to update family'
            });
        }
    }

    /**
     * DELETE /api/families/:id
     * Delete family (admin only)
     */
    async deleteFamily(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const result = await familyService.deleteFamily(id, req.user.id);

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Delete family error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message === 'Only admin can delete family') {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to delete family'
            });
        }
    }

    /**
     * POST /api/families/:id/join
     * Request to join a family
     */
    async createJoinRequest(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { message } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const request = await familyService.createJoinRequest(id, req.user.id, message);

            return res.status(201).json({
                message: 'Join request sent successfully',
                data: request
            });
        } catch (error: any) {
            console.error('Create join request error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('already')) {
                return res.status(409).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to create join request'
            });
        }
    }

    /**
     * GET /api/families/:id/join-requests
     * Get all join requests for a family (admin only)
     */
    async getJoinRequests(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { status } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const requests = await familyService.getFamilyJoinRequests(
                id,
                req.user.id,
                status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
            );

            return res.status(200).json({
                data: requests
            });
        } catch (error: any) {
            console.error('Get join requests error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message === 'Only admin can view join requests') {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get join requests'
            });
        }
    }

    /**
     * PUT /api/families/:id/join-requests/:requestId
     * Approve or reject join request (admin only)
     */
    async handleJoinRequest(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, requestId } = req.params;
            const { action } = req.body;

            if (!id || !requestId) {
                return res.status(400).json({ error: 'Family ID and Request ID are required' });
            }

            if (!action || !['APPROVE', 'REJECT'].includes(action)) {
                return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
            }

            const result = await familyService.handleJoinRequest(
                id,
                requestId,
                req.user.id,
                action
            );

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Handle join request error:', error);

            if (error.message === 'Family not found' || error.message === 'Join request not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Only admin') || error.message.includes('does not belong')) {
                return res.status(403).json({ error: error.message });
            }

            if (error.message.includes('already been processed')) {
                return res.status(409).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to handle join request'
            });
        }
    }

    /**
     * GET /api/families/:id/join-requests/:requestId/suggestions
     * Get link suggestions for join request (Phase 2)
     */
    async getJoinRequestSuggestions(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, requestId } = req.params;

            if (!id || !requestId) {
                return res.status(400).json({ error: 'Family ID and Request ID are required' });
            }

            const suggestions = await familyService.getJoinRequestSuggestions(
                id,
                requestId,
                req.user.id
            );

            return res.status(200).json({
                data: suggestions
            });
        } catch (error: any) {
            console.error('Get suggestions error:', error);

            if (error.message === 'Family not found' || error.message === 'Join request not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Only admin')) {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get suggestions'
            });
        }
    }

    /**
     * PUT /api/families/:id/join-requests/:requestId/approve
     * Approve join request with linking option (Phase 2)
     */
    async approveJoinRequestWithLink(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, requestId } = req.params;
            const { action, linkOption, memberId } = req.body;

            if (!id || !requestId) {
                return res.status(400).json({ error: 'Family ID and Request ID are required' });
            }

            if (!action || !['APPROVE', 'REJECT'].includes(action)) {
                return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
            }

            if (action === 'APPROVE' && linkOption && !['AUTO', 'MANUAL', 'NEW'].includes(linkOption)) {
                return res.status(400).json({ error: 'Link option must be AUTO, MANUAL, or NEW' });
            }

            if (linkOption === 'MANUAL' && !memberId) {
                return res.status(400).json({ error: 'Member ID is required for MANUAL link option' });
            }

            const result = await familyService.handleJoinRequestWithLink(
                id,
                requestId,
                req.user.id,
                action,
                linkOption,
                memberId
            );

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Approve with link error:', error);

            if (error.message === 'Family not found' || error.message === 'Join request not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Only admin') || error.message.includes('does not belong')) {
                return res.status(403).json({ error: error.message });
            }

            if (error.message.includes('already been processed')) {
                return res.status(409).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to approve join request'
            });
        }
    }

    /**
     * POST /api/families/:id/leave
     * Leave family (unlink member, remove from users)
     */
    async leaveFamily(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const result = await familyService.leaveFamily(id, req.user.id);

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Leave family error:', error);

            if (error.message.includes('not a member')) {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('must transfer admin')) {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to leave family'
            });
        }
    }

    /**
     * POST /api/families/:id/transfer-admin
     * Transfer admin role to another user
     */
    async transferAdmin(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { newAdminId } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            if (!newAdminId) {
                return res.status(400).json({ error: 'New admin ID is required' });
            }

            const result = await familyService.transferAdmin(id, req.user.id, newAdminId);

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Transfer admin error:', error);

            if (error.message === 'Family not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Only admin') || error.message.includes('must be a member')) {
                return res.status(403).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to transfer admin'
            });
        }
    }

    /**
     * GET /api/families/:id/statistics
     * Get family statistics (births, marriages, deaths by year)
     */
    async getStatistics(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { fromYear, toYear } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Family ID is required' });
            }

            const stats = await familyService.getFamilyStatistics(
                id,
                req.user.id,
                fromYear ? parseInt(fromYear as string) : undefined,
                toYear ? parseInt(toYear as string) : undefined
            );

            return res.status(200).json({
                data: stats
            });
        } catch (error: any) {
            console.error('Get statistics error:', error);

            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return res.status(404).json({ error: error.message });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get statistics'
            });
        }
    }
}
