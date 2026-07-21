import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

// CSRF note: We use SameSite=Lax cookies for refresh tokens and Bearer tokens
// for all API calls. Classic CSRF attacks are mitigated because:
// 1. The access token is sent in the Authorization header, not cookies
// 2. SameSite=Lax prevents cross-origin cookie sending for state-changing requests
// 3. CORS restricts which origins can make requests
// No additional CSRF token mechanism is needed.

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ];

      // Allow requests without Origin (Swagger, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  }),
);
  app.use(compression());
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.use("/api", apiLimiter);

  // API docs — development only. Loaded synchronously and registered BEFORE
  // app.use("/api", routes) / notFoundMiddleware below — Express middleware
  // order is fixed by when app.use() is called, not when it finishes loading,
  // so this must not use a dynamic import().then(...) or it registers too
  // late and every request to /api/docs falls through to the 404 handler.
  if (env.NODE_ENV === "development") {
    try {
      const doc = YAML.load("./openapi.yaml");
      app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(doc));
      logger.info("Swagger UI available at /api/docs");
    } catch {
      logger.warn("Failed to load OpenAPI doc for Swagger UI");
    }
  }

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}