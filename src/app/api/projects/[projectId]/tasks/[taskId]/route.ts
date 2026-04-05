import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  validationError,
  getCurrentUser,
  getMembership,
  canWrite,
  isLeader,
  logActivity,
  createNotification,
  logRequest,
} from "@/lib/api-utils";
import { updateTaskSchema } from "@/lib/validations/task";

type Params = { params: { projectId: string; taskId: string } };

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true, image: true } },
  creator: { select: { id: true, name: true, email: true, image: true } },
  checklist: { orderBy: { order: "asc" as const } },
  comments: {
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  attachments: { orderBy: { createdAt: "desc" as const } },
  _count: { select: { comments: true, checklist: true, attachments: true } },
};

export async function GET(_req: NextRequest, { params }: Params) {
  logRequest(
    "GET",
    `/api/projects/${params.projectId}/tasks/${params.taskId}`
  );
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();

    const task = await prisma.task.findFirst({
      where: { id: params.taskId, projectId: params.projectId },
      include: TASK_INCLUDE,
    });

    if (!task) return notFound("Task not found.");
    return ok(task);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  logRequest(
    "PATCH",
    `/api/projects/${params.projectId}/tasks/${params.taskId}`
  );
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();
    if (!canWrite(membership.role))
      return forbidden("Viewers cannot edit tasks.");

    const task = await prisma.task.findFirst({
      where: { id: params.taskId, projectId: params.projectId },
    });
    if (!task) return notFound("Task not found.");

    if (!isLeader(membership.role) && task.creatorId !== user.id) {
      return forbidden("You can only edit tasks you created.");
    }

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { deadline, ...rest } = parsed.data;

    const updated = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        ...rest,
        ...(deadline !== undefined
          ? { deadline: deadline ? new Date(deadline) : null }
          : {}),
      },
      include: TASK_INCLUDE,
    });

    if (parsed.data.status && parsed.data.status !== task.status) {
      await logActivity({
        projectId: params.projectId,
        taskId: task.id,
        userId: user.id,
        action: "task.status_changed",
        metadata: { from: task.status, to: parsed.data.status },
      });
    }

    if (
      parsed.data.assigneeId &&
      parsed.data.assigneeId !== task.assigneeId &&
      parsed.data.assigneeId !== user.id
    ) {
      await createNotification({
        userId: parsed.data.assigneeId,
        title: "Task assigned to you",
        body: `${user.name ?? user.email} assigned "${task.title}" to you.`,
        href: `/projects/${params.projectId}`,
      });
    }

    return ok(updated);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  logRequest(
    "DELETE",
    `/api/projects/${params.projectId}/tasks/${params.taskId}`
  );
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();

    const task = await prisma.task.findFirst({
      where: { id: params.taskId, projectId: params.projectId },
    });
    if (!task) return notFound("Task not found.");

    if (!isLeader(membership.role) && task.creatorId !== user.id) {
      return forbidden("You can only delete tasks you created.");
    }

    await prisma.task.delete({ where: { id: params.taskId } });

    await logActivity({
      projectId: params.projectId,
      userId: user.id,
      action: "task.deleted",
      metadata: { title: task.title },
    });

    return noContent();
  } catch (error) {
    return serverError(error);
  }
}