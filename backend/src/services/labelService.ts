// backend/src/services/labelService.ts
import { prisma } from '../app';
import { LabelCreateInput, LabelUpdateInput } from '../types/label';

/**
 * createLabel
 * Creates a new label for the user
 */
export const createLabel = async (userId: string, data: LabelCreateInput) => {
  const label = await prisma.label.create({
    data: { userId, name: data.name, color: data.color },
  });
  return label;
};

/**
 * getLabel
 * Fetch a single label by ID, including associated tasks
 * Ensures label belongs to the user
 */
export const getLabel = async (userId: string, labelId: string) => {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
    include: { tasks: { include: { task: true } } }, // include actual tasks, not just TaskLabel
  });

  if (!label) {
    throw new Error('Label not found');
  }

  if (label.userId !== userId) {
    throw new Error('Unauthorized access to label');
  }

  return label;
};

/**
 * getLabels
 * Fetch all labels belonging to a user with their associated tasks
 */
export const getLabels = async (userId: string) => {
  const labels = await prisma.label.findMany({
    where: { userId },
    include: { tasks: { include: { task: true } } }, // include tasks for each label
    orderBy: { createdAt: 'asc' },
  });
  return labels;
};

/**
 * updateLabel
 * Updates label fields for a given user and label ID
 */
export const updateLabel = async (userId: string, id: string, data: LabelUpdateInput) => {
  const existing = await prisma.label.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error('Unauthorized access to label');

  const updated = await prisma.label.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * deleteLabel
 * Deletes a label ensuring it belongs to the user
 */
export const deleteLabel = async (userId: string, id: string) => {
  const existing = await prisma.label.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error('Unauthorized access to label');

  await prisma.label.delete({ where: { id } });
};