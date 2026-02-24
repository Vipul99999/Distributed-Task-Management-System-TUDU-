
import { Request, Response } from 'express';
import * as labelService from '../services/labelService';
import { LabelCreateSchema, LabelUpdateSchema } from '../utils/validators';
import { sendResponse } from '../utils/response';
import { ZodError } from 'zod';

// -------------------- CREATE LABEL --------------------
export const createLabel = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing user ID');

    const validated = LabelCreateSchema.parse(req.body);
    const label = await labelService.createLabel(userId, validated);

    return sendResponse(res, 201, label);
  } catch (err: any) {
    const message =
      err instanceof ZodError
        ? Object.values(err.flatten().fieldErrors).flat().join(', ')
        : err.message;
    return sendResponse(res, 400, null, message);
  }
};

// -------------------- GET ALL LABELS --------------------
export const getLabels = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing user ID');

    const labels = await labelService.getLabels(userId);
    return sendResponse(res, 200, labels);
  } catch (err: any) {
    return sendResponse(res, 400, null, err.message);
  }
};


// -------------------- UPDATE LABEL --------------------
export const updateLabel = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing user ID');

    const validated = LabelUpdateSchema.parse(req.body);
    const label = await labelService.updateLabel(userId, req.params.id, validated);

    return sendResponse(res, 200, label);
  } catch (err: any) {
    const message =
      err instanceof ZodError
        ? Object.values(err.flatten().fieldErrors).flat().join(', ')
        : err.message;
    return sendResponse(res, 400, null, message);
  }
};

// -------------------- DELETE LABEL --------------------
export const deleteLabel = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, null, 'Unauthorized: Missing user ID');

    await labelService.deleteLabel(userId, req.params.id);
    return sendResponse(res, 204, null, 'Label deleted successfully');
  } catch (err: any) {
    return sendResponse(res, 404, null, err.message);
  }
};

