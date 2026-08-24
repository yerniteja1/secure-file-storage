import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload as uploadMiddleware } from '../utils/fileUpload';
import * as fileController from '../controllers/fileController';

const router = Router();

// Authenticated routes
router.post('/upload', authenticate, uploadMiddleware.single('file'), fileController.upload);
router.get('/', authenticate, fileController.list);
router.get('/:id', authenticate, fileController.getOne);
router.get('/:id/download', authenticate, fileController.download);
router.delete('/:id', authenticate, fileController.remove);
router.patch('/:id', authenticate, fileController.update);
router.patch('/:id/share', authenticate, fileController.toggleShare);

// Public routes (no auth required)
router.get('/public/:shareId', fileController.getPublic);
router.get('/public/:shareId/download', fileController.downloadPublic);

export default router;