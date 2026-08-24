import { Router, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload, getFileUrl } from '../utils/fileUpload';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { fileUpdateSchema, paginationSchema, FileUpdateInput, PaginationInput } from '../utils/validation';
import { ApiResponse, PaginatedResponse, FileUploadResponse } from '../types';
import { File } from '@prisma/client';

const router = Router();

// Upload a file
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided');
      }

      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const fileUrl = getFileUrl(req.file.filename);

      const file = await prisma.file.create({
        data: {
          userId: req.user.userId,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });

      const response: ApiResponse<FileUploadResponse> = {
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          isPublic: file.isPublic,
          shareId: file.shareId,
          createdAt: file.createdAt,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// List user's files
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const params: PaginationInput = paginationSchema.parse(req.query);
      const skip = (params.page - 1) * params.limit;

      const where = {
        userId: req.user.userId,
        ...(params.search && {
          OR: [
            { originalName: { contains: params.search, mode: 'insensitive' as const } },
            { filename: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: params.limit,
        }),
        prisma.file.count({ where }),
      ]);

      const response: PaginatedResponse<FileUploadResponse> = {
        success: true,
        data: files.map((file: File) => ({
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          isPublic: file.isPublic,
          shareId: file.shareId,
          createdAt: file.createdAt,
        })),
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get single file
router.get(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (file.userId !== req.user.userId) {
        throw new ForbiddenError('Access denied');
      }

      const response: ApiResponse<FileUploadResponse> = {
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          isPublic: file.isPublic,
          shareId: file.shareId,
          createdAt: file.createdAt,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Download file
router.get(
  '/:id/download',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (file.userId !== req.user.userId) {
        throw new ForbiddenError('Access denied');
      }

      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', file.filename);

      res.download(filePath, file.originalName, (err) => {
        if (err) {
          next(new NotFoundError('File not found on disk'));
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete file
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (file.userId !== req.user.userId) {
        throw new ForbiddenError('Access denied');
      }

      // Delete file from filesystem
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', file.filename);
      await fs.unlink(filePath).catch(() => {
        // File might already be deleted, continue
      });

      // Delete from database
      await prisma.file.delete({
        where: { id: req.params.id },
      });

      const response: ApiResponse = {
        success: true,
        data: { message: 'File deleted successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update file metadata
router.patch(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const updateData: FileUpdateInput = fileUpdateSchema.parse(req.body);

      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (file.userId !== req.user.userId) {
        throw new ForbiddenError('Access denied');
      }

      const updatedFile = await prisma.file.update({
        where: { id: req.params.id },
        data: updateData,
      });

      const response: ApiResponse<FileUploadResponse> = {
        success: true,
        data: {
          id: updatedFile.id,
          filename: updatedFile.filename,
          originalName: updatedFile.originalName,
          mimeType: updatedFile.mimeType,
          size: updatedFile.size,
          url: updatedFile.url,
          isPublic: updatedFile.isPublic,
          shareId: updatedFile.shareId,
          createdAt: updatedFile.createdAt,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Toggle public/private and generate share link
router.patch(
  '/:id/share',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (file.userId !== req.user.userId) {
        throw new ForbiddenError('Access denied');
      }

      // Toggle public status and generate shareId if making public
      const newIsPublic = !file.isPublic;
      const shareId = newIsPublic ? crypto.randomBytes(16).toString('hex') : null;

      const updatedFile = await prisma.file.update({
        where: { id: req.params.id },
        data: {
          isPublic: newIsPublic,
          shareId,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          id: updatedFile.id,
          isPublic: updatedFile.isPublic,
          shareId: updatedFile.shareId,
          shareUrl: shareId ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${shareId}` : null,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Access public file (no auth required)
router.get(
  '/public/:shareId',
  async (req, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.file.findUnique({
        where: { shareId: req.params.shareId },
      });

      if (!file || !file.isPublic) {
        throw new NotFoundError('File not found or not public');
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          createdAt: file.createdAt,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Download public file (no auth required)
router.get(
  '/public/:shareId/download',
  async (req, res: Response, next: NextFunction) => {
    try {
      const file = await prisma.file.findUnique({
        where: { shareId: req.params.shareId },
      });

      if (!file || !file.isPublic) {
        throw new NotFoundError('File not found or not public');
      }

      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', file.filename);

      res.download(filePath, file.originalName, (err) => {
        if (err) {
          next(new NotFoundError('File not found on disk'));
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;