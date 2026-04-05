import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  created,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  validationError,
  getCurrentUser,
  getMembership,
  canWrite,
  createNotification,
  logRequest,
} from "@/lib/api-utils";
import { createCommentSchema } from "@/lib/validations/task";

type Params = { params: { projectId: string; taskId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  logRequest("POST", "comments");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const m = await getMembership(user.id, params.projectId);
    if (!m) return notFound();
    if (!canWrite(m.role)) return forbidden("Viewers cannot comment.");

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const comment = await prisma.comment.create({
      data: {
        body: parsed.data.body,
        taskId: params.taskId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
    });
    if (task?.assigneeId && task.assigneeId !== user.id) {
      await createNotification({
        userId: task.assigneeId,
        title: "New comment on your task",
        body: `${user.name ?? user.email} commented on "${task.title}".`,
        href: `/projects/${params.projectId}`,
      });
    }

    return created(comment);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const m = await getMembership(user.id, params.projectId);
    if (!m) return notFound();

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");
    if (!commentId) return notFound("commentId required");

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return notFound();
    if (comment.authorId !== user.id)
      return forbidden("You can only delete your own comments.");

    await prisma.comment.delete({ where: { id: commentId } });
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}