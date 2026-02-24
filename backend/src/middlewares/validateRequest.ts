import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const validate = (
  schema: ZodObject<ZodRawShape>,
  location: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        location === 'body' ? req.body :
        location === 'query' ? req.query :
        req.params;

      schema.parse(data);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        // Use err.issues instead of err.errors
        const messages = err.issues.map(issue => issue.message);
        return res.status(400).json({
          status: 400,
          message: messages.join(', ') || 'Validation error',
          data: null,
        });
      }

      console.error('[Validation Unexpected Error]', err);
      return res.status(500).json({
        status: 500,
        message: 'Internal server error during validation',
        data: null,
      });
    }
  };
};
