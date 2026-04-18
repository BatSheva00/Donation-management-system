import { Server, Socket } from 'socket.io';
import { logger } from './logger';
import jwt from 'jsonwebtoken';
import { User } from '../features/users/user.model';

interface SocketUser {
  userId: string;
  role: string;
  permissions?: string[];
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

// Store connected users: userId -> socketId
const connectedUsers = new Map<string, string>();

export const initializeSocketIO = (io: Server): void => {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    console.log('🔐 WebSocket auth attempt - Token:', token ? token.substring(0, 20) + '...' : 'NONE');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user with role and permissions
      const user = await User.findById(decoded.userId)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            model: 'Permission',
          },
        });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Extract permissions
      const role = user.role as any;
      const permissions = role?.permissions || [];
      const permissionKeys = permissions.map((p: any) => p.key);

      socket.user = {
        userId: decoded.userId,
        role: role?.key || 'user',
        permissions: permissionKeys,
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`✅ Socket connected: ${socket.id} - User: ${socket.user?.userId}`);
    
    // Store user connection
    if (socket.user?.userId) {
      connectedUsers.set(socket.user.userId, socket.id);
      
      // Join user-specific room
      socket.join(`user:${socket.user.userId}`);
    }
    
    // Join role-specific room
    if (socket.user?.role) {
      socket.join(`role:${socket.user.role}`);
    }

    // Join permission-based rooms
    socket.user?.permissions?.forEach((permission) => {
      socket.join(`permission:${permission}`);
    });

    logger.info(`👤 User ${socket.user?.userId} joined rooms:`, [
      `user:${socket.user?.userId}`,
      `role:${socket.user?.role}`,
      ...socket.user?.permissions!.map(p => `permission:${p}`),
    ]);

    // Handle driver location updates
    socket.on('driver:location', (data: { latitude: number; longitude: number }) => {
      if (socket.user?.role === 'driver') {
        io.to(`role:admin`).emit('driver:location:update', {
          driverId: socket.user.userId,
          ...data,
          timestamp: new Date(),
        });
      }
    });

    // Handle donation status updates (deprecated - now handled server-side)
    socket.on('donation:status', (data: { donationId: string; status: string }) => {
      io.emit('donation:update', data);
    });

    // Handle driver availability
    socket.on('driver:availability', (data: { available: boolean }) => {
      if (socket.user?.role === 'driver') {
        io.to(`role:admin`).emit('driver:availability:update', {
          driverId: socket.user.userId,
          ...data,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`❌ Socket disconnected: ${socket.id} - User: ${socket.user?.userId}`);
      if (socket.user?.userId) {
        connectedUsers.delete(socket.user.userId);
      }
    });
  });
};

/**
 * Send notification to specific users
 */
export const sendToUsers = (io: Server, userIds: string[], event: string, data: any) => {
  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, data);
  });
};

/**
 * Send notification to users with specific permission
 */
export const sendToPermission = (io: Server, permission: string, event: string, data: any) => {
  io.to(`permission:${permission}`).emit(event, data);
};

/**
 * Send notification to all connected users
 */
export const sendToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};

export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getConnectedUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};






