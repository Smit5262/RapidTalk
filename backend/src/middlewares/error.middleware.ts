import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";
import { logger } from "../config/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 422, err.flatten().fieldErrors);
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, "Non-operational AppError");
    }
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  return sendError(res, "Internal server error", 500);
}

export function notFoundMiddleware(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}