import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  addMemberSchema,
} from "@/lib/validations/project";
import { Role } from "@prisma/client";

describe("Project API validation", () => {
  it("accepts a project with only a name", () => {
    const result = createProjectSchema.safeParse({
      name: "Website Redesign",
    });
    expect(result.success).toBe(true);
  });
  it("rejects an empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
  it("rejects non-hex color", () => {
    const result = createProjectSchema.safeParse({
      name: "Project",
      color: "purple",
    });
    expect(result.success).toBe(false);
  });
  it("accepts valid member invite", () => {
    const result = addMemberSchema.safeParse({
      email: "bob@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe(Role.MEMBER);
  });
});