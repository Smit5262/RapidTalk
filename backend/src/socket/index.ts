import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { verifyAccessToken } from "../utils/jwt";
import { AccessTokenPayload } from "../types/auth.types";
import { setIO } from "./emitter";
import { handlePresenceConnect, handlePresenceDisconnect } from "./handlers/presence.handler";
import { registerChannelHandlers } from "./handlers/channel.handler";
import { registerTypingHandlers } from "./handlers/typing.handler";

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

  setIO(io);

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
    const userId = socket.user!.sub;
    logger.info({ userId }, "Socket connected");

    socket.join(`user:${userId}`);

    handlePresenceConnect(socket, userId).catch((err) =>
      logger.error({ err, userId }, "Failed to handle presence on connect"),
    );

    registerChannelHandlers(socket, userId);
    registerTypingHandlers(socket, userId);

    socket.on("disconnect", () => {
      logger.info({ userId }, "Socket disconnected");
      handlePresenceDisconnect(userId).catch((err) =>
        logger.error({ err, userId }, "Failed to handle presence on disconnect"),
      );
    });
  });

  return io;
}