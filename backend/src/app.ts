import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Initialize Prisma
console.log("[Server] Initializing database connection...");
export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
console.log("[Server] Prisma client initialized");

// Initialize Express app
const app: Application = express();
console.log("[Server] Express app created");

// ======================
// Middlewares
// ======================

console.log("[Server] Applying Helmet for security headers");
app.use(helmet());

console.log("[Server] Applying CORS middleware");
app.use(cors({
  origin: process.env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL, // frontend URL
  credentials: true, // allow cookies/auth headers
}));

console.log("[Server] Applying request logging middleware (morgan)");
app.use(morgan('dev'));

console.log("[Server] Applying body parsers");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log("[Server] Applying rate limiter to /api routes");
app.use('/api', apiLimiter);

// ======================
// Routes
// ======================
console.log("[Server] Registering API routes under /api");
app.use('/api', routes);

// ======================
// Error handling middleware
// ======================
console.log("[Server] Applying error handling middleware");
app.use(errorHandler);

// ======================
// Health check
// ======================
console.log("[Server] Setting up health check endpoints");
app.get('/', (req, res) => {
  console.log("[Health] GET / called");
  res.json({ status: 'ok', db: 'tuduDB', message: 'Database connected and you are at home page' });
});
app.get('/health', (req, res) => {
  console.log("[Health] GET /health called");
  res.json({ status: 'ok', db: 'tuduDB' });
});

// ======================
// Export app
// ======================
console.log("[Server] Server setup complete. Ready to listen for requests.");

export default app;
