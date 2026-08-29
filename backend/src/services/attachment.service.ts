import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { config } from '../config';
import path from 'path';
import fs from 'fs';
import { activityService } from './activity.service';

export class AttachmentService {
  async findByTask(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(taskId: string, uploaderId: string, file: Express.Multer.File) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task not found');

    const attachment = await prisma.attachment.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: file.path,
        taskId,
        uploaderId,
      },
    });

    await activityService.log({
      taskId, userId: uploaderId,
      action: `Uploaded file: ${file.originalname}`,
      details: { fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype },
    });

    return prisma.attachment.findUnique({
      where: { id: attachment.id },
      include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async uploadToComment(commentId: string, uploaderId: string, file: Express.Multer.File) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError('Comment not found');

    const attachment = await prisma.attachment.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: file.path,
        commentId,
        uploaderId,
      },
    });

    return attachment;
  }

  async delete(attachmentId: string, userId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundError('Attachment not found');
    if (attachment.uploaderId !== userId) throw new NotFoundError('Not authorized');

    // Delete file from disk
    if (fs.existsSync(attachment.storagePath)) {
      fs.unlinkSync(attachment.storagePath);
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment deleted' };
  }

  async download(attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundError('Attachment not found');
    return attachment;
  }
}

export const attachmentService = new AttachmentService();
