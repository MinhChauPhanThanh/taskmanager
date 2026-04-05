import { describe, it, expect, vi } from "vitest";
import { canWrite, isLeader } from "@/lib/api-utils";
import { Role } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: { findUnique: vi.fn() },
    activityLog: { create: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("canWrite", () => {
  it("returns true for LEADER", () => {
    expect(canWrite(Role.LEADER)).toBe(true);
  });
  it("returns true for MEMBER", () => {
    expect(canWrite(Role.MEMBER)).toBe(true);
  });
  it("returns false for VIEWER", () => {
    expect(canWrite(Role.VIEWER)).toBe(false);
  });
});

describe("isLeader", () => {
  it("returns true only for LEADER", () => {
    expect(isLeader(Role.LEADER)).toBe(true);
    expect(isLeader(Role.MEMBER)).toBe(false);
    expect(isLeader(Role.VIEWER)).toBe(false);
  });
});