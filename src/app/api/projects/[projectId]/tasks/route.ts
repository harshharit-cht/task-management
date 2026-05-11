// src/app/api/projects/[projectId]/tasks/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { TaskStatus, TaskPriority } from "@prisma/client";
import {
  getAuthSession, successResponse, errorResponse,
  requireProjectMember, requireProjectAdmin,
} from "@/lib/api-helpers";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/projects/[projectId]/tasks
export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const { searchParams } = new URL(req.url);
  const status    = searchParams.get("status") as TaskStatus | null;
  const assigneeId = searchParams.get("assigneeId");
  const priority  = searchParams.get("priority") as TaskPriority | null;

  const tasks = await db.task.findMany({
    where: {
      projectId,
      ...(status     && { status }),
      ...(assigneeId && { assigneeId }),
      ...(priority   && { priority }),
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator:  { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return successResponse(tasks);
}

// POST /api/projects/[projectId]/tasks
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  try {
    const body = await req.json();
    const { tagIds, dueDate, ...rest } = createTaskSchema.parse(body);

    const task = await db.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: session!.user.id,
        ...(tagIds?.length && {
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator:  { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    return successResponse(task, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse(err.issues[0].message);
    return errorResponse("Failed to create task", 500);
  }
}