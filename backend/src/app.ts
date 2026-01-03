import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import familyRoutes from "./routes/family.routes";
import memberRoutes from "./routes/member.routes";
import memberRequestRoutes from "./routes/member-request.routes";
import notificationRoutes from "./routes/notification.routes";
import confessionRoutes from './routes/confession.routes';
import eventRoutes from "./routes/event.routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4028",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Family Tree API is running with HOT RELOAD! 🔥",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Family Tree API",
      version: "1.0.0",
      description: "API for Family Tree Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/families", memberRoutes); // Member routes nested under families
app.use("/api/families", memberRequestRoutes); // Member request routes nested under families
app.use("/api/notifications", notificationRoutes);
app.use('/api/families', confessionRoutes); // Confession routes nested under families
app.use("/api/families", eventRoutes);

// TODO: Add more routes as features are implemented
// app.use('/api/achievements', achievementRoutes);
// app.use('/api/confessions', confessionRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "🌳 Family Tree API Server",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Global error:", error);

    res.status(error.status || 500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
  }
);

export default app;
