import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required.' })
    .trim()
    .min(2, 'Task title must be at least 2 characters.')
    .max(160, 'Task title cannot exceed 160 characters.'),
  description: z.string().trim().max(2000).optional().nullable(),
  assigneeId: z.string().uuid('Invalid assignee UUID.').optional().nullable(),
  dueAt: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO-8601 timestamp.' })
    .optional()
    .nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Task title must be at least 2 characters.')
      .max(160, 'Task title cannot exceed 160 characters.')
      .optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    assigneeId: z.string().uuid('Invalid assignee UUID.').optional().nullable(),
    dueAt: z
      .string()
      .datetime({ message: 'Due date must be a valid ISO-8601 timestamp.' })
      .optional()
      .nullable(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update.' }
  );

export const taskIdParamSchema = z.object({
  teamId: z.string().uuid('Invalid Team ID format.'),
  taskId: z.string().uuid('Invalid Task ID format.'),
});
