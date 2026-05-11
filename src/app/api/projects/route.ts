// src/app/api/projects/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession, successResponse, errorResponse } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// GET /api/projects — get all projects for current user
export async function GET() {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const projects = await db.project.findMany({
    where: {
      members: { some: { userId: session!.user.id } },
    },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(projects);
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  try {
    const body = await req.json();
    const data = createProjectSchema.parse(body);

    const project = await db.project.create({
      data: {
        ...data,
        creatorId: session!.user.id,
        members: {
          create: {
            userId: session!.user.id,
            role: Role.ADMIN, // creator is always admin
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    return successResponse(project, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return errorResponse( err.issues[0].message);
    return errorResponse("Failed to create project", 500);
  }
}