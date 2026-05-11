// src/app/api/projects/[projectId]/members/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import {
  getAuthSession, successResponse, errorResponse,
  requireProjectAdmin, requireProjectMember,
} from "@/lib/api-helpers";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

// GET /api/projects/[projectId]/members
export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const members = await db.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return successResponse(members);
}

// POST /api/projects/[projectId]/members — add a member by email
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: adminError } = await requireProjectAdmin(projectId, session!.user.id);
  if (adminError) return adminError;

  try {
    const body = await req.json();
    const { email, role } = addMemberSchema.parse(body);

    const userToAdd = await db.user.findUnique({ where: { email } });
    if (!userToAdd) return errorResponse("No user found with that email", 404);

    const existing = await db.projectMember.findUnique({
      where: { userId_projectId: { userId: userToAdd.id, projectId } },
    });
    if (existing) return errorResponse("User is already a member of this project", 409);

    const member = await db.projectMember.create({
      data: { userId: userToAdd.id, projectId, role },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return successResponse(member, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse(err.errors[0].message);
    return errorResponse("Failed to add member", 500);
  }
}