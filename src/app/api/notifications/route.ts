import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  noContent,
  unauthorized,
  serverError,
  getCurrentUser,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ok(notifications);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    }

    return noContent();
  } catch (e) {
    return serverError(e);
  }
}