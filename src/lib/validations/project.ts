import { z } from "zod";
import { Role } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .default("#6366f1"),
});

export const updateProjectSchema = createProjectSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;