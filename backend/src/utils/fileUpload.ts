import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from './errors';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10); // 100MB

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/quicktime',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-extension
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // One file at a time
  },
});

// Middleware for handling multer errors
export function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw new BadRequestError(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      throw new BadRequestError('Too many files');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new BadRequestError('Unexpected field name');
    }
  }
  next(err);
}

// Helper to get file URL
export function getFileUrl(filename: string): string {
  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
}

// Helper to validate file size
export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new BadRequestError(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
}