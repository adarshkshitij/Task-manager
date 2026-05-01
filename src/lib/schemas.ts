import { Role, TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(Role),
});

export const projectSchema = z.object({
  name: z.string().trim().min(3, "Project name must be at least 3 characters."),
  description: z
    .string()
    .trim()
    .max(300, "Description must be 300 characters or less.")
    .optional()
    .transform((value) => value || undefined),
});

export const projectMemberSchema = z.object({
  userId: z.string().min(1, "Select a user."),
});

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Task title must be at least 3 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less.")
    .optional()
    .transform((value) => value || undefined),
  status: z.enum(TaskStatus).default(TaskStatus.TODO),
  priority: z.enum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => value === undefined || !Number.isNaN(value.getTime()), "Enter a valid due date."),
  projectId: z.string().min(1, "Project is required."),
  assignedToId: z.string().min(1, "Assignee is required."),
});

export const taskStatusUpdateSchema = z.object({
  status: z.enum(TaskStatus),
});
