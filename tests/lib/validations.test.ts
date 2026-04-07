import { describe, it, expect } from "vitest";
import { createTaskSchema } from "@/lib/validations/task";
import { createProjectSchema } from "@/lib/validations/project";
import { loginSchema, registerSchema } from "@/lib/auth";
import { TaskStatus, Priority } from "@prisma/client";

describe("createTaskSchema", () => {
  it("accepts valid task data", () => {
    const result = createTaskSchema.safeParse({
      title: "Fix bug",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
    });
    expect(result.success).toBe(true);
  });
  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
  it("applies default status of TODO", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe(TaskStatus.TODO);
  });
  it("applies default priority of MEDIUM", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.priority).toBe(Priority.MEDIUM);
  });
});

describe("createProjectSchema", () => {
  it("accepts valid project data", () => {
    const result = createProjectSchema.safeParse({
      name: "My Project",
      color: "#6366f1",
    });
    expect(result.success).toBe(true);
  });
  it("rejects invalid hex color", () => {
    const result = createProjectSchema.safeParse({
      name: "My Project",
      color: "notacolor",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "pass123",
    });
    expect(result.success).toBe(false);
  });
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "a@b.com",
      password: "pass123",
    });
    expect(result.success).toBe(false);
  });
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});