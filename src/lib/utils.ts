// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskStatus, TaskPriority } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === TaskStatus.DONE) return false;
  return new Date(dueDate) < new Date();
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  TODO:        { label: "To Do",      color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" },
  IN_PROGRESS: { label: "In Progress",color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"  },
  IN_REVIEW:   { label: "In Review",  color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  DONE:        { label: "Done",       color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW:    { label: "Low",    color: "text-slate-400",  bg: "bg-slate-500/10"  },
  MEDIUM: { label: "Medium", color: "text-blue-400",   bg: "bg-blue-500/10"   },
  HIGH:   { label: "High",   color: "text-orange-400", bg: "bg-orange-500/10" },
  URGENT: { label: "Urgent", color: "text-red-400",    bg: "bg-red-500/10"    },
};

export const PROJECT_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#06b6d4","#f97316","#84cc16",
];