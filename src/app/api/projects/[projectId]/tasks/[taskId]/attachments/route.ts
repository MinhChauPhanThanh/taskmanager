import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  created,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  getCurrentUser,
  getMembership,
  canWrite,
  logRequest,
} from "@/lib/api-utils";
import { handleUpload, UploadError } from "@/lib/upload";

type Params = { params: { projectId: string; taskId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  logRequest("POST", "attachments");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const m = await getMembership(user.id, params.projectId);
    if (!m) return notFound();
    if (!canWrite(m.role)) return forbidden();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return badRequest("No file provided.");

    let result;
    try {
      result = await handleUpload(file);
    } catch (e) {
      if (e instanceof UploadError) return badRequest(e.message);
      throw e;
    }

    const attachment = await prisma.attachment.create({
      data: {
        taskId: params.taskId,
        uploadedById: user.id,
        ...result,
      },
    });

    return created(attachment);
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
    const attachmentId = searchParams.get("attachmentId");
    if (!attachmentId) return badRequest("attachmentId required");

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment) return notFound();
    if (attachment.uploadedById !== user.id) return forbidden();

    await prisma.attachment.delete({ where: { id: attachmentId } });
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}