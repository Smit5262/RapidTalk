export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 400, errors: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}