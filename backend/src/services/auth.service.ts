import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { generateToken } from "../middleware/auth";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
    /**
     * Register a new user
     */
    async register(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
    }) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone ?? null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phone: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        const token = generateToken({
            id: user.id,
            email: user.email,
            firstName,
            lastName,
        });

        return { user, token };
    }

    /**
     * Login user with email and password
     */
    async login(email: string, password: string) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        // Generate JWT token
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        const token = generateToken({
            id: user.id,
            email: user.email,
            firstName,
            lastName,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    /**
     * Get user profile with relationships
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
                adminOfFamilies: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                memberOfFamilies: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                linkedMembers: {
                    select: {
                        id: true,
                        name: true,
                        familyId: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        data: {
            name?: string;
            phone?: string;
            avatar?: string;
        }
    ) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phone: true,
                updatedAt: true,
            },
        });

        return user;
    }

    /**
     * Google OAuth login
     */
    async googleLogin(googleToken: string) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (!clientId) {
                throw new Error("Google Client ID not configured");
            }

            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: googleToken,
                audience: clientId,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Error("Invalid Google token");
            }

            const { email, name, picture } = payload;

            // Find or create user
            let user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                // Create new user from Google account
                const emailParts = email.split("@");
                const userName = name || emailParts[0] || "User";
                user = await prisma.user.create({
                    data: {
                        email,
                        name: userName,
                        avatar: picture ?? null,
                        password: "", // Google users don't have password
                    },
                });
            }

            // Generate JWT token
            const nameParts = user.name.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            const token = generateToken({
                id: user.id,
                email: user.email,
                firstName,
                lastName,
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;

            return { user: userWithoutPassword, token };
        } catch (error: any) {
            console.error("Google login error:", error);
            throw new Error("Google authentication failed");
        }
    }

    /**
     * Change user password
     */
    async changePassword(userId: string, data: { oldPassword: string; newPassword: string }) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if the user has a password
        if (!user.password) {
             throw new Error("Account uses external login (Google). Please set a password first.");
        }

        // Verify old password
        const isValidPassword = await bcrypt.compare(data.oldPassword, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid old password");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        return { message: "Password updated successfully" };
    }
}
