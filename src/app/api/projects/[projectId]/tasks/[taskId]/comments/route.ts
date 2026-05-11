// src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession, successResponse, errorResponse, requireProjectMember } from "@/lib/api-helpers";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

// GET comments
export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string; taskId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, taskId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  const comments = await db.comment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return successResponse(comments);
}

// POST comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string; taskId: string }> }) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { projectId, taskId } = await params;
  const { error: memberError } = await requireProjectMember(projectId, session!.user.id);
  if (memberError) return memberError;

  try {
    const { content } = commentSchema.parse(await req.json());

    const comment = await db.comment.create({
      data: { content, taskId, authorId: session!.user.id },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return successResponse(comment, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse(err.errors[0].message);
    return errorResponse("Failed to post comment", 500);
  }
}