// src/types/index.ts
import { Role, TaskStatus, TaskPriority } from "@prisma/client";

export type { Role, TaskStatus, TaskPriority };

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assignee: User | null;
  creator: User;
  tags: TaskTag[];
  comments?: Comment[];
  _count?: { comments: number };
}

export interface ProjectMember {
  id: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  creator: User;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueCount: number;
}

export interface DashboardData {
  projects: Project[];
  tasksByStatus: { status: TaskStatus; _count: number }[];
  overdueTasks: (Task & { project: Pick<Project, "id" | "name" | "color"> })[];
  recentTasks:  (Task & { project: Pick<Project, "id" | "name" | "color"> })[];
  stats: DashboardStats;
}