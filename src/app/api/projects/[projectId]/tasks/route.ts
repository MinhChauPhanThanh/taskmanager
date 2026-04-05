import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  created,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  validationError,
  getCurrentUser,
  getMembership,
  canWrite,
  logActivity,
  createNotification,
  logRequest,
} from "@/lib/api-utils";
import { createTaskSchema } from "@/lib/validations/task";
import { Priority, TaskStatus } from "@prisma/client";

type Params = { params: { projectId: string } };

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

export async function GET(req: NextRequest, { params }: Params) {
  logRequest("GET", `/api/projects/${params.projectId}/tasks`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound("Project not found.");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") as TaskStatus | "ALL" | null;
    const priority = searchParams.get("priority") as Priority | "ALL" | null;
    const assigneeId = searchParams.get("assigneeId");
    const sortBy =
      (searchParams.get("sortBy") as
        | "deadline"
        | "priority"
        | "createdAt") ?? "order";
    const sortDir =
      (searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId,
        ...(search
          ? { title: { contains: search, mode: "insensitive" } }
          : {}),
        ...(status && status !== "ALL" ? { status } : {}),
        ...(priority && priority !== "ALL" ? { priority } : {}),
        ...(assigneeId && assigneeId !== "ALL" ? { assigneeId } : {}),
      },
      include: TASK_INCLUDE,
      orderBy:
        sortBy === "priority"
          ? [{ priority: sortDir }, { order: "asc" }]
          : [{ [sortBy]: sortDir }, { order: "asc" }],
    });

    return ok(tasks);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  logRequest("POST", `/api/projects/${params.projectId}/tasks`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound("Project not found.");
    if (!canWrite(membership.role))
      return forbidden("Viewers cannot create tasks.");

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const lastTask = await prisma.task.findFirst({
      where: {
        projectId: params.projectId,
        status: parsed.data.status ?? TaskStatus.TODO,
      },
      orderBy: { order: "desc" },
    });
    const order = (lastTask?.order ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        projectId: params.projectId,
        creatorId: user.id,
        order,
        deadline: parsed.data.deadline
          ? new Date(parsed.data.deadline)
          : null,
      },
      include: TASK_INCLUDE,
    });

    await logActivity({
      projectId: params.projectId,
      taskId: task.id,
      userId: user.id,
      action: "task.created",
      metadata: { title: task.title },
    });

    if (task.assigneeId && task.assigneeId !== user.id) {
      await createNotification({
        userId: task.assigneeId,
        title: "Task assigned to you",
        body: `${user.name ?? user.email} assigned "${task.title}" to you.`,
        href: `/projects/${params.projectId}`,
      });
    }

    return created(task);
  } catch (error) {
    return serverError(error);
  }
}