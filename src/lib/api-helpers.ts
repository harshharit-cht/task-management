// src/lib/api-helpers.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Check if user is a member of a project
export async function getProjectMember(projectId: string, userId: string) {
  return db.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

// Check if user is an admin of a project
export async function requireProjectAdmin(projectId: string, userId: string) {
  const member = await getProjectMember(projectId, userId);
  if (!member || member.role !== Role.ADMIN) {
    return { member: null, error: errorResponse("Only project admins can perform this action", 403) };
  }
  return { member, error: null };
}

// Check if user is a member (any role) of a project
export async function requireProjectMember(projectId: string, userId: string) {
  const member = await getProjectMember(projectId, userId);
  if (!member) {
    return { member: null, error: errorResponse("You are not a member of this project", 403) };
  }
  return { member, error: null };
}