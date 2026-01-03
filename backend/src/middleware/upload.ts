import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Multer configuration for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string = 'file') => {
    return upload.single(fieldName);
};

// Multiple files upload middleware  
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
    return upload.array(fieldName, maxCount);
};

// Upload file to Supabase Storage
export const uploadToSupabase = async (
    file: Express.Multer.File,
    bucket: string,
    folder: string = ''
): Promise<{ url: string; path: string }> => {
    if (!supabase) {
        throw new Error('Supabase client not configured');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            duplex: 'half'
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        url: urlData.publicUrl,
        path: filePath
    };
};

// Avatar upload middleware
export const handleAvatarUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            return next(); // No file uploaded, continue
        }

        const result = await uploadToSupabase(req.file, 'avatars', 'users');

        // Add URL to request body for further processing
        req.body.avatarUrl = result.url;
        req.body.avatarPath = result.path;

        next();
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(400).json({
            error: 'Avatar upload failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            code: 'UPLOAD_FAILED'
        });
    }
};

// Achievement images upload middleware
export const handleAchievementImagesUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return next(); // No files uploaded, continue
        }

        const uploadPromises = req.files.map((file: Express.Multer.File) =>
            uploadToSupabase(file, 'achievements', 'images')
        );

        const results = await Promise.all(uploadPromises);

        // Add URLs to request body
        req.body.imageUrls = results.map(r => r.url);
        req.body.imagePaths = results.map(r => r.path);

        next();
    } catch (error) {
        console.error('Achievement images upload error:', error);
        res.status(400).json({
            error: 'Images upload failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            code: 'UPLOAD_FAILED'
        });
    }
};

// Delete file from Supabase Storage
export const deleteFromSupabase = async (bucket: string, filePath: string) => {
    if (!supabase) {
        throw new Error('Supabase client not configured');
    }

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
};

// Error handling middleware for upload errors
export const handleUploadError = (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                maxSize: process.env.MAX_FILE_SIZE || '5MB',
                code: 'FILE_TOO_LARGE'
            });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                code: 'TOO_MANY_FILES'
            });
        }
    }

    if (error.message.includes('File type') && error.message.includes('not allowed')) {
        return res.status(400).json({
            error: error.message,
            allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(','),
            code: 'INVALID_FILE_TYPE'
        });
    }

    // Pass other errors to global error handler
    return next(error);
};
