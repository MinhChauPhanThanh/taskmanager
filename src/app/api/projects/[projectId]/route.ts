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
  isLeader,
  logRequest,
} from "@/lib/api-utils";
import { updateProjectSchema } from "@/lib/validations/project";

type Params = { params: { projectId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  logRequest("GET", `/api/projects/${params.projectId}`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) return notFound();
    return ok(project);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  logRequest("PATCH", `/api/projects/${params.projectId}`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();
    if (!isLeader(membership.role))
      return forbidden("Only leaders can update projects.");

    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const project = await prisma.project.update({
      where: { id: params.projectId },
      data: parsed.data,
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    return ok(project);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  logRequest("DELETE", `/api/projects/${params.projectId}`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();
    if (!isLeader(membership.role))
      return forbidden("Only leaders can delete projects.");

    await prisma.project.delete({ where: { id: params.projectId } });
    return noContent();
  } catch (error) {
    return serverError(error);
  }
}