import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/helpers';

class SocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication required'));
      }
      try {
        const user = verifyAccessToken(token);
        (socket as any).userId = user.id;
        (socket as any).userRole = user.role;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      if (userId) {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        socket.join(`user:${userId}`);
      }

      socket.on('join:task', (taskId: string) => {
        socket.join(`task:${taskId}`);
      });

      socket.on('leave:task', (taskId: string) => {
        socket.leave(`task:${taskId}`);
      });

      socket.on('disconnect', () => {
        if (userId && this.userSockets.has(userId)) {
          this.userSockets.get(userId)!.delete(socket.id);
          if (this.userSockets.get(userId)!.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  notifyUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  notifyTask(taskId: string, event: string, data: any) {
    this.io?.to(`task:${taskId}`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.io?.emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

export const socketService = new SocketService();
