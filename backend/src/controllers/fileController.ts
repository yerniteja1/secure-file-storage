import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { BadRequestError, ForbiddenError } from '../utils/errors';
import { fileUpdateSchema, paginationSchema, FileUpdateInput, PaginationInput } from '../utils/validation';
import * as fileService from '../services/fileService';

export async function upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new BadRequestError('No file provided');
    }

    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const file = await fileService.uploadFile(req.user.userId, req.file);

    const response: ApiResponse = { success: true, data: file };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const params: PaginationInput = paginationSchema.parse(req.query);
    const result = await fileService.listFiles(req.user.userId, params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const file = await fileService.getFile(req.params.id, req.user.userId);

    const response: ApiResponse = { success: true, data: file };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function download(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const { filePath, originalName } = await fileService.getFilePath(req.params.id, req.user.userId);

    res.download(filePath, originalName, (err) => {
      if (err) {
        next(new BadRequestError('File not found on disk'));
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listTrash(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const params: PaginationInput = paginationSchema.parse(req.query);
    const result = await fileService.listTrash(req.user.userId, params);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    await fileService.deleteFile(req.params.id, req.user.userId);

    const response: ApiResponse = { success: true, data: { message: 'File moved to trash' } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function restore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const file = await fileService.restoreFile(req.params.id, req.user.userId);

    const response: ApiResponse = { success: true, data: file };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function permanentDelete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    await fileService.permanentDeleteFile(req.params.id, req.user.userId);

    const response: ApiResponse = { success: true, data: { message: 'File permanently deleted' } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const updateData: FileUpdateInput = fileUpdateSchema.parse(req.body);
    const file = await fileService.updateFile(req.params.id, req.user.userId, updateData);

    const response: ApiResponse = { success: true, data: file };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function toggleShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const result = await fileService.toggleShare(req.params.id, req.user.userId);

    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getPublic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await fileService.getFileByShareId(req.params.shareId);

    const response: ApiResponse = { success: true, data: file };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function downloadPublic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { filePath, originalName } = await fileService.getPublicFilePath(req.params.shareId);

    res.download(filePath, originalName, (err) => {
      if (err) {
        next(new BadRequestError('File not found on disk'));
      }
    });
  } catch (error) {
    next(error);
  }
}