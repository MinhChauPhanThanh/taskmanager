import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  created,
  unauthorized,
  serverError,
  validationError,
  getCurrentUser,
  logRequest,
} from "@/lib/api-utils";
import { createProjectSchema } from "@/lib/validations/project";
import { Role } from "@prisma/client";

export async function GET() {
  logRequest("GET", "/api/projects");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const projects = await prisma.project.findMany({
      where: { memberships: { some: { userId: user.id } } },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return ok(projects);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  logRequest("POST", "/api/projects");
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        memberships: {
          create: { userId: user.id, role: Role.LEADER },
        },
      },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    return created(project);
  } catch (error) {
    return serverError(error);
  }
}