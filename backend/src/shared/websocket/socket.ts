import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../../features/users/user.model";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userPermissions?: string[];
}

let io: Server;

// Store connected users: userId -> socketId
const connectedUsers = new Map<string, string>();

export const initializeWebSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user with role and permissions
      const user = await User.findById(decoded.userId).populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Extract permissions
      const role = user.role as any;
      const permissions = role?.permissions || [];
      const permissionKeys = permissions.map((p: any) => p.key);

      socket.userId = decoded.userId;
      socket.userRole = role?.key || "user";
      socket.userPermissions = permissionKeys;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Store user connection
    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);

      // Join user-specific room
      socket.join(`user:${socket.userId}`);

      // Join permission-based rooms
      socket.userPermissions?.forEach((permission) => {
        socket.join(`permission:${permission}`);
      });

      console.log(`👤 User ${socket.userId} joined rooms:`, [
        `user:${socket.userId}`,
        ...socket.userPermissions!.map((p) => `permission:${p}`),
      ]);
    }

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getConnectedUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};

/**
 * Send notification to specific users
 */
export const sendToUsers = (userIds: string[], event: string, data: any) => {
  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, data);
  });
};

/**
 * Send notification to users with specific permission
 */
export const sendToPermission = (
  permission: string,
  event: string,
  data: any
) => {
  io.to(`permission:${permission}`).emit(event, data);
};

/**
 * Send notification to all connected users
 */
export const sendToAll = (event: string, data: any) => {
  io.emit(event, data);
};



