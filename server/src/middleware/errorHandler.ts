import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../lib/config.js';

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (code) this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad Request', details?: any) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Not Found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflict') {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static internal(message: string = 'Internal Server Error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

const sanitizeErrorForLogging = (err: any) => {
  if (config.server.nodeEnv === 'production') {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      ...(err instanceof ApiError && { code: err.code, statusCode: err.statusCode })
    };
  }
  return err;
};

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): ApiError => {
  switch (err.code) {
    case 'P2002':
      return ApiError.conflict('A record with this data already exists');
    case 'P2025':
      return ApiError.notFound('Record not found');
    case 'P2003':
      return ApiError.badRequest('Foreign key constraint failed');
    default:
      return ApiError.internal('Database operation failed');
  }
};

const normalizeError = (err: any): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof ZodError) {
    return ApiError.badRequest('Validation error', err.issues);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return ApiError.badRequest('Invalid database query');
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expired');
  }

  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    return ApiError.badRequest('Invalid JSON format');
  }

  // For unknown errors, don't expose internal details
  const message = config.server.nodeEnv === 'development' 
    ? err.message || 'Internal server error'
    : 'Internal server error';

  return ApiError.internal(message);
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const normalizedError = normalizeError(err);
  
  // Safe logging
  console.error('Error occurred:', sanitizeErrorForLogging(err));

  const response: ErrorResponse = {
    success: false,
    error: {
      message: normalizedError.message,
      ...(normalizedError.code && { code: normalizedError.code }),
      ...(normalizedError.details && { details: normalizedError.details })
    }
  };

  res.status(normalizedError.statusCode).json(response);
};