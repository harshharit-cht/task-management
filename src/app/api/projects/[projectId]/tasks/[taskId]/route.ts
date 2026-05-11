// src/app/api/projects/[projectId]/tasks/[taskId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { TaskStatus, TaskPriority } from "@prisma/client";
import {
  getAuthSession, successResponse, errorResponse,
  requireProjectMember, requireProjectAdmin,
} from "@/lib/api-helpers";

const updateTaskSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status:      z.nativeEnum(TaskStatus).optional(),
  priority:    z.nativeEnum(TaskPriority).optional(),
  dueDate:     z.string().datetime().optional().nullable(),
  assigneeId:  z.string().optional().nullable(),
  position:    z.number().int().optional(),
  tagIds:      z.array(z.string()).optional(),
});

// GET /api/projects/[projectId]/tasks/[taskId]
export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string; taskId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, taskId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, image: true, email: true } },
      creator:  { select: { id: true, name: true, image: true, email: true } },
      tags: { include: { tag: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) return errorResponse("Task not found", 404);
  return successResponse(task);
}

// PATCH /api/projects/[projectId]/tasks/[taskId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string; taskId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, taskId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  try {
    const body = await req.json();
    const { tagIds, dueDate, ...rest } = updateTaskSchema.parse(body);

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator:  { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    return successResponse(task);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse(err.errors[0].message);
    return errorResponse("Failed to update task", 500);
  }
}

// DELETE /api/projects/[projectId]/tasks/[taskId]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ projectId: string; taskId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, taskId } = await params;

  // Only admins or the task creator can delete
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return errorResponse("Task not found", 404);

  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const isCreator = task.creatorId === session!.user.id;
  const { member } = await requireProjectAdmin(projectId, session!.user.id).catch(() => ({ member: null, error: null }));

  if (!isCreator && !member) {
    return errorResponse("Only the task creator or an admin can delete this task", 403);
  }

  await db.task.delete({ where: { id: taskId } });
  return successResponse({ message: "Task deleted" });
}