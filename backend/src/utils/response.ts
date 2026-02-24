// backend/src/utils/response.ts
import { Response } from 'express';

/**
 * Standardized response format
 * @param res Express Response object
 * @param status HTTP status code
 * @param data Response payload
 * @param message Optional message
 */
export const sendResponse = (
  res: Response,
  status: number,
  data: any = null,
  message: string = 'Success'
) => {
  console.log("Route Hits Sending Tasks....",message);
  return res.status(status).json({
    status,
    message,
    data,
  });
};
