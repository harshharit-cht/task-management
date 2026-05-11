// src/app/api/projects/[projectId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  getAuthSession, successResponse, errorResponse,
  requireProjectMember, requireProjectAdmin,
} from "@/lib/api-helpers";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// GET /api/projects/[projectId]
export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          creator:  { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!project) return errorResponse("Project not found", 404);
  return successResponse(project);
}

// PATCH /api/projects/[projectId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: adminError } = await requireProjectAdmin(projectId, session!.user.id);
  if (adminError) return adminError;

  try {
    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const project = await db.project.update({
      where: { id: projectId },
      data,
      include: {
        creator:  { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    return successResponse(project);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse( err.issues[0].message);
    return errorResponse("Failed to update project", 500);
  }
}

// DELETE /api/projects/[projectId]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: adminError } = await requireProjectAdmin(projectId, session!.user.id);
  if (adminError) return adminError;

  await db.project.delete({ where: { id: projectId } });
  return successResponse({ message: "Project deleted successfully" });
}