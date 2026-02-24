import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { TaskCreateSchema, TaskUpdateSchema } from '../utils/validators';
import { sendResponse } from '../utils/response';
import { mapSubTasks } from '../utils/mapTasks';
import { TaskCreateInput, TaskUpdateInput } from '../types/task';
import { ZodError } from 'zod';
import { isValidUUID } from '../utils/validateUUID'; // optional helper
import * as subtaskService from "../services/subtaskService"
// -------------------- CREATE TASK --------------------
export const createTask = async (req: Request, res: Response) => {
  console.log('[Controller] Create Task started');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const validated = TaskCreateSchema.parse(req.body);
    
    // Optional: validate parentTaskId/contextId if they exist
    if (validated.parentTaskId && !isValidUUID(validated.parentTaskId)) {
      return sendResponse(res, 400, null, 'Invalid parentTaskId format');
    }
    if (validated.contextId && !isValidUUID(validated.contextId)) {
      return sendResponse(res, 400, null, 'Invalid contextId format');
    }
    
    const taskInput: TaskCreateInput = {
      ...validated,
      userId,
      subtasks: mapSubTasks(validated.subtasks),
    };

    const task = await taskService.createTask(userId, taskInput);
    
    return sendResponse(res, 201, task);
  } catch (err: any) {
    console.error('[Controller] Error in createTask:', err);

    if (err instanceof ZodError) {
      const message = Object.values(err.flatten().fieldErrors).flat().join(', ');
      return sendResponse(res, 422, null, message);
    }

    return sendResponse(res, err.statusCode || 400, null, err.message || 'Failed to create task');
  }
};

// -------------------- GET ALL TASKS --------------------
export const getTasks = async (req: Request, res: Response) => {
  console.log('[Controller] Get Tasks started');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const tasks = await taskService.getTasks(userId, req.query);
    
    return sendResponse(res, 200, tasks);
  } catch (err: any) {
    console.error('[Controller] Error in getTasks:', err);
    return sendResponse(res, 400, null, err.message);
  }
};

// -------------------- GET TASK BY ID --------------------
export const getTaskById = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  
  if (!isValidUUID(taskId)) return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const task = await taskService.getTaskById(userId, taskId);
    
    return sendResponse(res, 200, task);
  } catch (err: any) {
    console.error('[Controller] Error in getTaskById:', err);
    return sendResponse(res, 404, null, err.message);
  }
};

// -------------------- UPDATE TASK --------------------
export const updateTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;

  if (!isValidUUID(taskId)) return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const validated = TaskUpdateSchema.parse(req.body);
   
    const taskInput: TaskUpdateInput = {
      ...validated,
      subtasks: mapSubTasks(validated.subtasks),
    };

    const updatedTask = await taskService.updateTask(userId, taskId, taskInput);
    
    return sendResponse(res, 200, updatedTask);
  } catch (err: any) {
    console.error('[Controller] Error in updateTask:', err);
    const message =
      err instanceof ZodError
        ? Object.values(err.flatten().fieldErrors).flat().join(', ')
        : err.message;
    return sendResponse(res, 400, null, message);
  }
};

// -------------------- DELETE TASK --------------------
export const deleteTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  
  if (!isValidUUID(taskId)) return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    await taskService.deleteTask(userId, taskId);
    return sendResponse(res, 200, { deleted: true });
  } catch (err: any) {
    console.error('[Controller] Error in deleteTask:', err);
    return sendResponse(res, 404, null, err.message);
  }
};

// -------------------- BATCH SYNC --------------------
export const batchSync = async (req: Request, res: Response) => {
  console.log('[Controller] Batch Sync started');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const tasks = req.body.tasks;
    if (!Array.isArray(tasks)) return sendResponse(res, 400, null, 'Invalid tasks array');

    const normalizedTasks = tasks.map((t: any) => ({
      ...t,
      subtasks: mapSubTasks(t.subtasks),
    }));

    const synced = await taskService.batchSync(userId, normalizedTasks);
    return sendResponse(res, 200, synced);
  } catch (err: any) {
    console.error('[Controller] Error in batchSync:', err);
    return sendResponse(res, 400, null, err.message);
  }
};

// -------------------- GET SUBTASKS --------------------
export const getSubtasks = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  if (!isValidUUID(taskId)) return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const subtasks = await subtaskService.getSubtasks(userId, taskId);
    
    return sendResponse(res, 200, subtasks);
  } catch (err: any) {
    console.error('[Controller] Error in getSubtasks:', err);
    return sendResponse(res, 404, null, err.message);
  }
};

// -------------------- UPDATE SUBTASK --------------------

export const updateSubtask = async (req: Request, res: Response) => {
  const taskId = req.params.id; // parent task ID

  if (!isValidUUID(taskId)) 
    return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) 
      return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const subtasks = req.body.subtasks; // array of subtasks from frontend
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return sendResponse(res, 400, null, 'No subtasks provided');
    }

    // Call the syncSubtasks service
    const updatedSubtasks = await subtaskService.syncSubtasks(userId, taskId, subtasks);

    return sendResponse(res, 200, updatedSubtasks);
  } catch (err: any) {
    console.error('[Controller] Error in updateSubtask:', err);
    return sendResponse(res, 500, null, err.message);
  }
};


// -------------------- GET DEPENDENCIES --------------------
export const getDependencies = async (req: Request, res: Response) => {
  const taskId = req.params.id;
 
  if (!isValidUUID(taskId)) return sendResponse(res, 400, null, 'Invalid Task ID');

  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing userId');

    const dependencies = await subtaskService.getDependencies(userId, taskId);
    return sendResponse(res, 200, dependencies);
  } catch (err: any) {
    console.error('[Controller] Error in getDependencies:', err);
    return sendResponse(res, 404, null, err.message);
  }
};


/**
 * POST /api/tasks/reorder
 * Body: { reordered: [{ id: string; orderIndex: number }] }
 */
export const reorderTask = async (req: Request, res: Response) => {
  try {
    const { reordered } = req.body;
    if (!Array.isArray(reordered)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    await taskService.reorderTasks(reordered);
    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error: any) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ message: "Failed to reorder tasks", error: error.message });
  }
};

