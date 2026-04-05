import { z } from "zod";
import { TaskStatus, Priority } from "@prisma/client";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  deadline: z.string().datetime().nullable().optional(),
  assigneeId: z.string().cuid().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().int().min(0).optional(),
});

export const createChecklistItemSchema = z.object({
  text: z.string().min(1).max(300),
  order: z.number().int().min(0).optional(),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(300).optional(),
  checked: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;