import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        }
    }
}

// JWT Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            code: 'MISSING_TOKEN'
        });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({
            error: 'Server configuration error',
            code: 'JWT_NOT_CONFIGURED'
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        };
        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        } else {
            return res.status(401).json({
                error: 'Token verification failed',
                code: 'TOKEN_VERIFICATION_FAILED'
            });
        }
    }
};

// Optional authentication (for public routes that can benefit from user context)
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // No token, continue without user context
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return next(); // No secret configured, continue without user context
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        };
    } catch (error) {
        // Invalid token, but continue without user context
        console.warn('Invalid token in optional auth:', error);
    }

    next();
};

// Generate JWT token
export const generateToken = (payload: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
};
