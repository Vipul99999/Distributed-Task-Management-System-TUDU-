import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 300, // limit each IP to 100 requests per window
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
    data: null,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
