// src/routes/taskRoutes.ts
import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { validate } from '../middlewares/validateRequest';
import {  TaskUpdateSchema } from '../utils/validators';

const router = Router();

// -------------------- Middleware --------------------
// Apply authentication middleware to all routes in this router
router.use((req, res, next) => {
  next();
});

// -------------------- Static / Non-CRUD Endpoints --------------------
// Batch sync tasks
router.post('/sync', taskController.batchSync);

// Reorder tasks
router.post('/reorder', taskController.reorderTask);

// Subtasks
router.post('/:id/subtasks', taskController.updateSubtask);

// Dependencies
router.get('/:id/dependencies', taskController.getDependencies);

// -------------------- Task CRUD --------------------
// Create a task
router.post(
  '/',
  // validate(TaskCreateSchema),
  taskController.createTask
);

// Get all tasks
router.get(
  '/',
  // validate(TaskQuerySchema, 'query'),
  taskController.getTasks
);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Update a task
router.put(
  '/:id',
  validate(TaskUpdateSchema),
  taskController.updateTask
);

// Delete a task
router.delete('/:id', taskController.deleteTask);

export default router;
