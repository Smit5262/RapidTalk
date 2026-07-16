import { Response } from "express";

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  errors: null;
}

interface ApiFailure {
  success: false;
  message: string;
  data: null;
  errors: unknown;
}

export function sendSuccess<T>(res: Response, data: T, message = "OK", statusCode = 200) {
  const body: ApiSuccess<T> = { success: true, message, data, errors: null };
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode = 400, errors: unknown = null) {
  const body: ApiFailure = { success: false, message, data: null, errors };
  return res.status(statusCode).json(body);
}