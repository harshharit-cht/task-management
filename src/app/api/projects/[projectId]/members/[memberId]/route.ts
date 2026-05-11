// src/app/api/projects/[projectId]/members/[memberId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import {
  getAuthSession, successResponse, errorResponse, requireProjectAdmin,
} from "@/lib/api-helpers";

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// PATCH — update a member's role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string; memberId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, memberId } = await params;
  const { error: adminError } = await requireProjectAdmin(projectId, session!.user.id);
  if (adminError) return adminError;

  try {
    const { role } = updateRoleSchema.parse(await req.json());

    const member = await db.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return successResponse(member);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse(err.errors[0].message);
    return errorResponse("Failed to update member role", 500);
  }
}

// DELETE — remove a member
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ projectId: string; memberId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, memberId } = await params;
  const { error: adminError } = await requireProjectAdmin(projectId, session!.user.id);
  if (adminError) return adminError;

  const member = await db.projectMember.findUnique({ where: { id: memberId } });
  if (!member) return errorResponse("Member not found", 404);

  // Prevent removing yourself if you're the only admin
  if (member.userId === session!.user.id) {
    return errorResponse("You cannot remove yourself from the project", 400);
  }

  await db.projectMember.delete({ where: { id: memberId } });
  return successResponse({ message: "Member removed" });
}