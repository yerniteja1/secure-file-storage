import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';

interface ErrorResponse {
  success: boolean;
  error: string;
  code: string;
  details?: unknown;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
    res.status(422).json(response);
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  const response: ErrorResponse = {
    success: false,
    error: 'Internal server error',
    code: 'SERVER_ERROR',
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
  }

  res.status(500).json(response);
}