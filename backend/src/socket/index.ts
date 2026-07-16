import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { verifyAccessToken } from "../utils/jwt";
import { AccessTokenPayload } from "../types/auth.types";

interface AuthedSocket extends Socket {
  user?: AccessTokenPayload;
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error("Invalid or expired auth token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    logger.info({ userId: socket.user?.sub }, "Socket connected");

    if (socket.user) {
      socket.join(`user:${socket.user.sub}`);
    }

    // Phase 3: socket.on("channel:join", ...), "message:send", "typing:start" etc.
    // Phase 3: presence tracking via Redis (set online on connect, offline on disconnect).

    socket.on("disconnect", () => {
      logger.info({ userId: socket.user?.sub }, "Socket disconnected");
    });
  });

  return io;
}