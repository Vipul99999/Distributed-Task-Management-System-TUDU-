import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

// Centralized error handler middleware
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if error is an instance of Error and has custom properties
  if (err instanceof Error) {
    message = err.message;

    // @ts-ignore: optional statusCode on custom errors
    if ((err as any).statusCode) {
      // Use custom status code if provided
      statusCode = (err as any).statusCode;
    }
  }

  // Log error details (stack trace in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorHandler]', { error: err, stack: (err as Error)?.stack });
  } else {
    console.error('[ErrorHandler]', err);
  }

  // Send response
  sendResponse(res, statusCode, null, message);
};
