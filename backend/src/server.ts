import { createServer } from "http";
import { createApp } from "./app";
import { createSocketServer } from "./socket";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/database";
import { redis } from "./config/redis";

const app = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 RapidTalk API listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  httpServer.close();
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));