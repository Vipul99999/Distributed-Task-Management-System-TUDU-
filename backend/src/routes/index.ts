import { Router, Request, Response, NextFunction } from 'express';
import taskRoutes from './taskRoutes';
import labelRoutes from './labelRoutes';
import improveRoutes from './improveRoutes';
import { isAuthenticated } from '../middlewares/isAuthenticated';
const router = Router();

// Log router initialization
console.log('[ Index Router] Initializing main API router...');
console.log('[TaskRoutes Middlleware] going to call:')
router.use(isAuthenticated()); // Middleware ensures req.user is set

// Middleware to log all incoming requests to /api routes
router.use((req: Request, _res: Response, next: NextFunction) => {
  next();
});

// Mount sub-routers
console.log('[Router] Mounting /tasks routes');
router.use('/tasks', taskRoutes);

console.log('[Router] Mounting /labels routes');
router.use('/labels', labelRoutes);

console.log('[Router] Mounting /improve routes');
router.use('/improve', improveRoutes);



// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  console.log('[Router] Health check called');
  res.json({ status: 'ok' });
});

console.log('[Router] Main API router initialized');

export default router;
