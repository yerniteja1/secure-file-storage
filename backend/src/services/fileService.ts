import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { getFileUrl } from '../utils/fileUpload';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { FileUpdateInput, PaginationInput } from '../utils/validation';
import { FileUploadResponse, PaginatedResponse } from '../types';
import { File } from '@prisma/client';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function toFileResponse(file: File): FileUploadResponse {
  return {
    id: file.id,
    filename: file.filename,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    url: file.url,
    isPublic: file.isPublic,
    shareId: file.shareId,
    createdAt: file.createdAt,
  };
}

async function getFileOrThrow(fileId: string, userId: string): Promise<File> {
  const file = await prisma.file.findUnique({ where: { id: fileId } });

  if (!file) {
    throw new NotFoundError('File not found');
  }

  if (file.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  return file;
}

export async function uploadFile(
  userId: string,
  file: Express.Multer.File
): Promise<FileUploadResponse> {
  const fileUrl = getFileUrl(file.filename);

  const dbFile = await prisma.file.create({
    data: {
      userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
    },
  });

  return toFileResponse(dbFile);
}

export async function listFiles(
  userId: string,
  params: PaginationInput
): Promise<PaginatedResponse<FileUploadResponse>> {
  const skip = (params.page - 1) * params.limit;

  const where = {
    userId,
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

  return {
    success: true,
    data: files.map(toFileResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getFile(fileId: string, userId: string): Promise<FileUploadResponse> {
  const file = await getFileOrThrow(fileId, userId);
  return toFileResponse(file);
}

export async function getFileByShareId(shareId: string): Promise<FileUploadResponse> {
  const file = await prisma.file.findUnique({ where: { shareId } });

  if (!file || !file.isPublic) {
    throw new NotFoundError('File not found or not public');
  }

  return toFileResponse(file);
}

export async function getFilePath(fileId: string, userId: string): Promise<{ filePath: string; originalName: string }> {
  const file = await getFileOrThrow(fileId, userId);
  const filePath = path.join(UPLOAD_DIR, file.filename);
  return { filePath, originalName: file.originalName };
}

export async function getPublicFilePath(shareId: string): Promise<{ filePath: string; originalName: string }> {
  const file = await prisma.file.findUnique({ where: { shareId } });

  if (!file || !file.isPublic) {
    throw new NotFoundError('File not found or not public');
  }

  const filePath = path.join(UPLOAD_DIR, file.filename);
  return { filePath, originalName: file.originalName };
}

export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const file = await getFileOrThrow(fileId, userId);

  const filePath = path.join(UPLOAD_DIR, file.filename);
  await fs.unlink(filePath).catch(() => {});

  await prisma.file.delete({ where: { id: fileId } });
}

export async function updateFile(
  fileId: string,
  userId: string,
  data: FileUpdateInput
): Promise<FileUploadResponse> {
  await getFileOrThrow(fileId, userId);

  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data,
  });

  return toFileResponse(updatedFile);
}

export async function toggleShare(
  fileId: string,
  userId: string
): Promise<{ id: string; isPublic: boolean; shareId: string | null; shareUrl: string | null }> {
  const file = await getFileOrThrow(fileId, userId);

  const newIsPublic = !file.isPublic;
  const shareId = newIsPublic ? crypto.randomBytes(16).toString('hex') : null;

  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: { isPublic: newIsPublic, shareId },
  });

  return {
    id: updatedFile.id,
    isPublic: updatedFile.isPublic,
    shareId: updatedFile.shareId,
    shareUrl: shareId ? `${FRONTEND_URL}/share/${shareId}` : null,
  };
}