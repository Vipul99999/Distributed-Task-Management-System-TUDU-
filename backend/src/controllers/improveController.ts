import { Request, Response } from 'express';
import * as improveService from '../services/improveService';

// ----------------------
// Create Improvement
// ----------------------
export const createImprove = async (req: Request, res: Response) => {
  console.log("👉 [createImprove in Controller] Request received");

  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn("⚠️ Unauthorized attempt to create improvement");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, futureNote, categoryId } = req.body;
    const improvement = await improveService.createImprovement(userId, {
      text,
      futureNote,
      categoryId,
    });
    res.status(201).json(improvement);
  } catch (error: any) {
    console.error("❌ [createImprove in Controller] Error:", error);
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

// ----------------------
// Get all improvements
// ----------------------
export const getImproves = async (req: Request, res: Response) => {
  console.log("👉 [getImproves in Controller] Request received");

  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn("⚠️ Unauthorized attempt to get improvements");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const improvements = await improveService.getImprovements(userId);
   
    res.json(improvements);
  } catch (error) {
    console.error("❌ [getImproves in Controller] Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ----------------------
// Update Improvement
// ----------------------
export const updateImprove = async (req: Request, res: Response) => {
  console.log("👉 [updateImprove in Controller] Request received");

  try {
    const userId = req.user?.id;
   
    if (!userId) {
      console.warn("⚠️ Unauthorized attempt to update improvement");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { text, futureNote, categoryId, isCompleted } = req.body;
   
    const updated = await improveService.updateImprovement(userId, id, {
      text,
      futureNote,
      categoryId,
      isCompleted,
    });

    res.json(updated);
  } catch (error: any) {
    console.error("❌ [updateImprove in Controller] Error:", error);
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

// ----------------------
// Get streaks
// ----------------------
export const getStreaks = async (req: Request, res: Response) => {
  console.log(" [getStreaks in Controller] Request received");

  try {
    const userId = req.user?.id;

    if (!userId) {
      console.warn("⚠️ Unauthorized attempt to get streaks");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const streaks = await improveService.getStreaks(userId);
    res.json(streaks);
  } catch (error) {
    console.error("❌ [getStreaks in Controller] Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ----------------------
// Get categories
// ----------------------
export const getCategories = async (req: Request, res: Response) => {
  console.log("👉 [getCategories in Controller] Request received");

  try {
    const categories = await improveService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error("❌ [getCategories in Controller] Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ----------------------
// Set categories
// ----------------------
export const setCategories = async (req: Request, res: Response) => {
  console.log("👉 [setCategories in Controller] Request received");

  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      console.warn("⚠️ Invalid categories format received");
      return res.status(400).json({ error: 'Invalid categories format' });
    }

    const preparedCategories = categories.map((cat: { name: string; color?: string; icon?: string }) => ({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));
    const userId = req.user?.id || "";
    const createdCategories = await improveService.createCategory(userId, preparedCategories);
    res.status(201).json(createdCategories);
  } catch (error) {
    console.error("❌ [setCategories in Controller] Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
