// src/validators/improvementValidator.ts
import { z } from 'zod';

export const createImprovementSchema = z.object({
  text: z
      .string()
      .min(3, { message: "Improvement must be at least 3 characters" })
      .max(500, "Maximum 500 characters are allowed"),
    futureNote: z.string().max(500, "Maximum 500 characters are allowed").optional(),
    categoryId: z.string().optional(),
});

export const updateImprovementSchema = z.object({
  text: z.string().min(3).max(500).optional(),
  futureNote: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters' })
    .max(50, { message: 'Category name cannot exceed 50 characters' }),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, { message: 'Invalid hex color' }).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
});

export const updateStreakSchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  endDate: z.string().optional(),
  length: z.number().min(1),
  isActive: z.boolean(),
});