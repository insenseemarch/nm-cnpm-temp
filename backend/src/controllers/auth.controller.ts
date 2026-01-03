import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response) {
        try {
            const { email, password, name, phone } = req.body;

            // Basic validation
            if (!email || !password || !name) {
                return res.status(400).json({
                    error: 'Email, password, and name are required'
                });
            }

            const result = await authService.register({ email, password, name, phone });

            return res.status(201).json({
                message: 'User registered successfully',
                data: result
            });
        } catch (error: any) {
            console.error('Register error:', error);

            // Handle specific errors
            if (error.message === 'Email already registered') {
                return res.status(409).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message || 'Registration failed'
            });
        }
    }

    /**
     * POST /api/auth/login
     * Login user with email and password
     */
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required'
                });
            }

            const result = await authService.login(email, password);

            return res.status(200).json({
                message: 'Login successful',
                data: result
            });
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message || 'Login failed'
            });
        }
    }

    /**
     * GET /api/auth/profile
     * Get current user profile (protected route)
     */
    async getProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const user = await authService.getProfile(req.user.id);

            return res.status(200).json({
                data: user
            });
        } catch (error: any) {
            console.error('Get profile error:', error);

            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message || 'Failed to get profile'
            });
        }
    }

    /**
     * PUT /api/auth/profile
     * Update user profile (protected route)
     */
    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { name, phone, avatar } = req.body;

            const user = await authService.updateProfile(req.user.id, { name, phone, avatar });

            return res.status(200).json({
                message: 'Profile updated successfully',
                data: user
            });
        } catch (error: any) {
            console.error('Update profile error:', error);
            return res.status(400).json({
                error: error.message || 'Profile update failed'
            });
        }
    }

    /**
     * POST /api/auth/google
     * Login with Google OAuth
     */
    async googleLogin(req: Request, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    error: 'Google token is required'
                });
            }

            const result = await authService.googleLogin(token);

            return res.status(200).json({
                message: 'Google login successful',
                data: result
            });
        } catch (error: any) {
            console.error('Google login error:', error);
            return res.status(401).json({
                error: error.message || 'Google authentication failed'
            });
        }
    }
    /**
     * PUT /api/auth/change-password
     * Change user password (protected route)
     */
    async changePassword(req: Request, res: Response) {
        try {
            // Check if the user is already logged in
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Old password and new password are required'
                });
            }

            if (oldPassword === newPassword) {
                 return res.status(400).json({
                    error: 'New password must be different from old password'
                });
            }

            await authService.changePassword(req.user.id, { oldPassword, newPassword });

            return res.status(200).json({
                message: 'Password updated successfully'
            });
        } catch (error: any) {
            console.error('Change password error:', error);

            if (error.message === 'Invalid old password') {
                return res.status(400).json({
                    error: error.message
                });
            }

            return res.status(400).json({
                error: error.message || 'Failed to update password'
            });
        }
    }
}
