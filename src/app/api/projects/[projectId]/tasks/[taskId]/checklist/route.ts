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
  logRequest,
} from "@/lib/api-utils";
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
} from "@/lib/validations/task";

type Params = { params: { projectId: string; taskId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  logRequest("POST", "checklist");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const m = await getMembership(user.id, params.projectId);
    if (!m) return notFound();
    if (!canWrite(m.role)) return forbidden();

    const body = await req.json();
    const parsed = createChecklistItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const last = await prisma.checklistItem.findFirst({
      where: { taskId: params.taskId },
      orderBy: { order: "desc" },
    });

    const item = await prisma.checklistItem.create({
      data: {
        ...parsed.data,
        taskId: params.taskId,
        order: (last?.order ?? -1) + 1,
      },
    });
    return created(item);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  logRequest("PATCH", "checklist");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const m = await getMembership(user.id, params.projectId);
    if (!m) return notFound();
    if (!canWrite(m.role)) return forbidden();

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return notFound("itemId required");

    const body = await req.json();
    const parsed = updateChecklistItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: parsed.data,
    });
    return ok(item);
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
    if (!canWrite(m.role)) return forbidden();

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return notFound("itemId required");

    await prisma.checklistItem.delete({ where: { id: itemId } });
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}