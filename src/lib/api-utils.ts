import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import type { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", details: error.flatten().fieldErrors },
    { status: 422 }
  );
}

export function serverError(error: unknown) {
  const message =
    process.env.NODE_ENV === "development"
      ? String(error)
      : "Internal server error";
  console.error("[API Error]", error);
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export async function getMembership(userId: string, projectId: string) {
  return prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

export function canWrite(role: Role): boolean {
  return role === Role.LEADER || role === Role.MEMBER;
}

export function isLeader(role: Role): boolean {
  return role === Role.LEADER;
}

export async function logActivity(params: {
  projectId: string;
  taskId?: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({ data: params }).catch(() => {
    console.warn("[ActivityLog] Failed to write activity log");
  });
}

export async function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  href?: string;
}) {
  await prisma.notification.create({ data: params }).catch(() => {
    console.warn("[Notification] Failed to create notification");
  });
}

export function logRequest(method: string, path: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  }
}
