import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { attachmentService } from '../services/attachment.service';
import { successResponse } from '../utils/responses';

export class AttachmentController {
  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachments = await attachmentService.findByTask(req.params.taskId);
      res.json(successResponse('Attachments retrieved', attachments));
    } catch (error) { next(error); }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const attachment = await attachmentService.upload(req.params.taskId, req.user!.id, req.file);
      res.status(201).json(successResponse('File uploaded', attachment));
    } catch (error) { next(error); }
  }

  async uploadToComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const attachment = await attachmentService.uploadToComment(req.params.commentId, req.user!.id, req.file);
      res.status(201).json(successResponse('File uploaded', attachment));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await attachmentService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Attachment deleted'));
    } catch (error) { next(error); }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await attachmentService.download(req.params.id);
      res.download(attachment.storagePath, attachment.originalName);
    } catch (error) { next(error); }
  }
}

export const attachmentController = new AttachmentController();
