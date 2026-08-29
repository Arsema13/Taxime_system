import { CommentQueryService } from './comment-query.service';
import { CommentCrudService } from './comment-crud.service';

export class CommentService {
  private query = new CommentQueryService();
  private crud = new CommentCrudService();

  async findByTask(taskId: string) {
    return this.query.findByTask(taskId);
  }

  async create(data: {
    taskId: string; authorId: string; content: string;
    parentId?: string; mentions?: string[];
  }) {
    return this.crud.create(data);
  }

  async update(commentId: string, userId: string, content: string) {
    return this.crud.update(commentId, userId, content);
  }

  async delete(commentId: string, userId: string, userRole: string) {
    return this.crud.delete(commentId, userId, userRole);
  }
}

export const commentService = new CommentService();
