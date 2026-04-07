import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  ok,
  badRequest,
  serverError,
  validationError,
  logRequest,
} from "@/lib/api-utils";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  logRequest("POST", "/api/auth/register");
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return badRequest("An account with that email already exists.");

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true },
    });

    return ok(user, 201);
  } catch (error) {
    return serverError(error);
  }
}