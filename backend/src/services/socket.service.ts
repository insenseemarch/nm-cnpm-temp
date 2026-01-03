import { Server } from "socket.io";
import jwt from "jsonwebtoken";

interface UserSocket {
    userId: string;
    socketId: string;
    familyIds: string[];
}

export class SocketService {
    private io: Server;
    private connectedUsers: Map<string, UserSocket> = new Map();

    constructor(io: Server) {
        this.io = io;
        this.setupSocketAuth();
    }

    private setupSocketAuth() {
        // Middleware for socket authentication
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error("No token provided"));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                (socket as any).user = decoded;
                next();
            } catch (error) {
                next(new Error("Invalid token"));
            }
        });

        this.io.on("connection", (socket) => {
            this.handleConnection(socket);
        });
    }

    private async handleConnection(socket: any) {
        const user = socket.user;

    // Store user connection
    const userSocket: UserSocket = {
      userId: user.id,
      socketId: socket.id,
      familyIds: []
    };
    
    this.connectedUsers.set(socket.id, userSocket);

    // Handle joining family rooms
    socket.on("join-families", async (familyIds: string[]) => {
      // Leave previous rooms
      userSocket.familyIds.forEach(familyId => {
        socket.leave(`family:${familyId}`);
      });

      // Join new family rooms
      familyIds.forEach(familyId => {
        socket.join(`family:${familyId}`);
      });

      // Update stored family IDs
      userSocket.familyIds = familyIds;
      this.connectedUsers.set(socket.id, userSocket);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      this.connectedUsers.delete(socket.id);
    });
  }

  // Emit notification to specific user
  public notifyUser(userId: string, notification: any) {
    const userSocket = Array.from(this.connectedUsers.values())
      .find(u => u.userId === userId);
    
    if (userSocket) {
      this.io.to(userSocket.socketId).emit("new-notification", notification);
    }
  }

  // Emit notification to all users in a family
  public notifyFamily(familyId: string, notification: any, excludeUserId?: string) {
    if (excludeUserId) {
      // Emit to all users in family except sender
      const familyUsers = Array.from(this.connectedUsers.values())
        .filter(u => u.familyIds.includes(familyId) && u.userId !== excludeUserId);
      
      familyUsers.forEach(user => {
        this.io.to(user.socketId).emit("new-notification", notification);
      });
    } else {
      // Emit to all users in family room
      this.io.to(`family:${familyId}`).emit("new-notification", notification);
    }
  }

    // Emit notification to multiple families
    public notifyFamilies(familyIds: string[], notification: any, excludeUserId?: string) {
        familyIds.forEach(familyId => {
            this.notifyFamily(familyId, notification, excludeUserId);
        });
    }
}

// Global socket service instance
let socketService: SocketService | null = null;

export const initSocketService = (io: Server) => {
    socketService = new SocketService(io);
    return socketService;
};

export const getSocketService = (): SocketService => {
    if (!socketService) {
        throw new Error("Socket service not initialized");
    }
    return socketService;
};