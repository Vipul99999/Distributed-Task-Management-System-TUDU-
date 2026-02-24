import helmet from 'helmet';
import cors from 'cors';

// Security middleware for Express (supports multiple microservices)
export const securityMiddleware = [
  // Helmet: secure HTTP headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: [
          "'self'",
          ...(process.env.ALLOWED_MICROSERVICES?.split(',') || []), // allow microservices to connect
        ],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  }),

  // CORS: allow frontend and microservice communication
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests (like server-to-server)
      const allowed = [
        ...(process.env.CORS_ORIGIN?.split(',') || []), // frontend URLs
        ...(process.env.ALLOWED_MICROSERVICES?.split(',') || []), // microservices
      ];
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];
