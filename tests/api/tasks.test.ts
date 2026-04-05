import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task";
import { TaskStatus, Priority } from "@prisma/client";

describe("Task API validation", () => {
  it("validates a minimal valid task", () => {
    const result = createTaskSchema.safeParse({ title: "New task" });
    expect(result.success).toBe(true);
  });
  it("rejects missing title", () => {
    const result = createTaskSchema.safeParse({
      priority: Priority.HIGH,
    });
    expect(result.success).toBe(false);
  });
  it("allows partial update", () => {
    const result = updateTaskSchema.safeParse({
      status: TaskStatus.DONE,
    });
    expect(result.success).toBe(true);
  });
  it("rejects negative order", () => {
    const result = updateTaskSchema.safeParse({ order: -1 });
    expect(result.success).toBe(false);
  });
});