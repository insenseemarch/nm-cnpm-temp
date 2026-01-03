import { Request, Response, NextFunction } from 'express';

// Generic validation middleware
export const validate = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map((detail: any) => ({
                    field: detail.path.join('.'),
                    message: detail.message
                })),
                code: 'VALIDATION_ERROR'
            });
        }

        return next();
    };
};

// Basic validation schemas (using simple JavaScript validation)
export const userRegistrationSchema = {
    validate: (data: any) => {
        const errors: any[] = [];

        // Email validation
        if (!data.email || !isValidEmail(data.email)) {
            errors.push({
                path: ['email'],
                message: 'Valid email is required'
            });
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            errors.push({
                path: ['password'],
                message: 'Password must be at least 6 characters'
            });
        }

        // Name validation
        if (!data.firstName || data.firstName.trim().length < 1) {
            errors.push({
                path: ['firstName'],
                message: 'First name is required'
            });
        }

        if (!data.lastName || data.lastName.trim().length < 1) {
            errors.push({
                path: ['lastName'],
                message: 'Last name is required'
            });
        }

        return {
            error: errors.length > 0 ? { details: errors } : null
        };
    }
};

export const userLoginSchema = {
    validate: (data: any) => {
        const errors: any[] = [];

        if (!data.email || !isValidEmail(data.email)) {
            errors.push({
                path: ['email'],
                message: 'Valid email is required'
            });
        }

        if (!data.password) {
            errors.push({
                path: ['password'],
                message: 'Password is required'
            });
        }

        return {
            error: errors.length > 0 ? { details: errors } : null
        };
    }
};

export const familyMemberSchema = {
    validate: (data: any) => {
        const errors: any[] = [];

        if (!data.name || data.name.trim().length < 1) {
            errors.push({
                path: ['name'],
                message: 'Name is required'
            });
        }

        if (!data.gender || !['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
            errors.push({
                path: ['gender'],
                message: 'Valid gender is required (MALE, FEMALE, OTHER)'
            });
        }

        if (data.generation && (typeof data.generation !== 'number' || data.generation < 0)) {
            errors.push({
                path: ['generation'],
                message: 'Generation must be a positive number'
            });
        }

        return {
            error: errors.length > 0 ? { details: errors } : null
        };
    }
};

export const eventSchema = {
    validate: (data: any) => {
        const errors: any[] = [];

        if (!data.title || data.title.trim().length < 1) {
            errors.push({
                path: ['title'],
                message: 'Event title is required'
            });
        }

        if (!data.eventDate || !isValidDate(data.eventDate)) {
            errors.push({
                path: ['eventDate'],
                message: 'Valid event date is required'
            });
        }

        return {
            error: errors.length > 0 ? { details: errors } : null
        };
    }
};

// Helper functions
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

// Request parameter validation
export const validateId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
        return res.status(400).json({
            error: 'Invalid ID parameter',
            code: 'INVALID_ID'
        });
    }

    return next();
};

// Query parameter validation
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
        return res.status(400).json({
            error: 'Page must be a positive number',
            code: 'INVALID_PAGE'
        });
    }

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
        return res.status(400).json({
            error: 'Limit must be between 1 and 100',
            code: 'INVALID_LIMIT'
        });
    }

    return next();
};
