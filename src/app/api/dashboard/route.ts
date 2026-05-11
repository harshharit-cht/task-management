// src/app/api/dashboard/route.ts
import { getAuthSession, successResponse, errorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { TaskStatus } from "@prisma/client";

export async function GET() {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const userId = session!.user.id;
  const now = new Date();

  const [projects, myTasks, overdueTasks, recentTasks] = await Promise.all([
    // All projects user is in
    db.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    }),

    // Tasks assigned to me grouped by status
    db.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: true,
    }),

    // Overdue tasks
    db.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),

    // Recently updated tasks across all my projects
    db.task.findMany({
      where: { project: { members: { some: { userId } } } },
      include: {
        project:  { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        creator:  { select: { id: true, name: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return successResponse({
    projects,
    tasksByStatus: myTasks,
    overdueTasks,
    recentTasks,
    stats: {
      totalProjects: projects.length,
      totalTasks: myTasks.reduce((acc, t) => acc + t._count, 0),
      completedTasks: myTasks.find((t) => t.status === TaskStatus.DONE)?._count ?? 0,
      overdueCount: overdueTasks.length,
    },
  });
}