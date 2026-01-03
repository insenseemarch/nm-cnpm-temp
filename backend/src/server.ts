import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import schedulerService from "./services/scheduler.service";
import { initSocketService } from "./services/socket.service";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize socket service
initSocketService(io);

// Make io instance available globally
(global as any).io = io;

// Start server
server.listen(PORT, () => {
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);

  // Start the notification scheduler
  schedulerService.start();
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("👋 Shutting down gracefully...");

  // Stop the scheduler
  schedulerService.stop();

  // Close server
  server.close(() => {
    console.log("🛑 Server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
