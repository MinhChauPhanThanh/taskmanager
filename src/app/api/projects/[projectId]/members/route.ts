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
  validationError,
  getCurrentUser,
  getMembership,
  isLeader,
  createNotification,
  logRequest,
} from "@/lib/api-utils";
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validations/project";

type Params = { params: { projectId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  logRequest("POST", `/api/projects/${params.projectId}/members`);
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();
    if (!isLeader(membership.role))
      return forbidden("Only leaders can add members.");

    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!targetUser) return notFound("No user found with that email.");

    const existing = await getMembership(targetUser.id, params.projectId);
    if (existing) return badRequest("User is already a member.");

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    });

    const newMembership = await prisma.membership.create({
      data: {
        userId: targetUser.id,
        projectId: params.projectId,
        role: parsed.data.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    await createNotification({
      userId: targetUser.id,
      title: "Added to project",
      body: `${user.name ?? user.email} added you to "${project?.name}".`,
      href: `/projects/${params.projectId}`,
    });

    return created(newMembership);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const membership = await getMembership(user.id, params.projectId);
    if (!membership) return notFound();
    if (!isLeader(membership.role))
      return forbidden("Only leaders can remove members.");

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return badRequest("memberId query param required.");

    await prisma.membership.delete({ where: { id: memberId } });
    return noContent();
  } catch (error) {
    return serverError(error);
  }
}