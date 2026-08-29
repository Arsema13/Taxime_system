import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { attachmentController } from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

const router = Router();

router.use(authenticate);

router.get('/task/:taskId', attachmentController.getByTask);
router.post('/task/:taskId', upload.single('file'), attachmentController.upload);
router.post('/comment/:commentId', upload.single('file'), attachmentController.uploadToComment);
router.get('/:id/download', attachmentController.download);
router.delete('/:id', attachmentController.delete);

export default router;
