// src/components/tasks/create-task-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Sparkles,
  CalendarDays,
  Flag,
  User2,
  FileText,
  CheckCircle2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TaskStatus, TaskPriority } from "@prisma/client";
import { useCreateTask } from "@/hooks/use-tasks";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import type { ProjectMember } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  members: ProjectMember[];
  defaultStatus?: TaskStatus;
}

const inputCls =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10";

const selectCls = `${inputCls} appearance-none cursor-pointer`;

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  members,
  defaultStatus,
}: Props) {
  const createTask = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),

    defaultValues: {
      status: defaultStatus ?? TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
  });

  const onSubmit = async (data: FormData) => {
    await createTask.mutateAsync({
      ...data,
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString()
        : undefined,
      assigneeId: data.assigneeId || undefined,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-2xl overflow-hidden border border-white/10 bg-[#0B0B12] p-0 text-white shadow-2xl">
        <DialogHeader className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-8 py-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <Sparkles size={24} />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                Create New Task
              </DialogTitle>

              <DialogDescription className="max-w-md text-sm leading-6 text-slate-400">
                Add a new task to your project board and assign it
                to a team member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7 px-8 py-7"
        >
          {/* Title */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <CheckCircle2 size={15} className="text-indigo-400" />
              Task Title
            </label>

            <input
              {...register("title")}
              placeholder="e.g. Fix authentication redirect issue"
              className={`${inputCls} text-base`}
            />

            {errors.title && (
              <p className="text-xs font-medium text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText size={15} className="text-indigo-400" />
              Description
              <span className="text-slate-600">(optional)</span>
            </label>

            <textarea
              {...register("description")}
              rows={5}
              placeholder="Describe the task in detail..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Status
              </label>

              <select
                {...register("status")}
                className={selectCls}
              >
                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                  <option
                    key={v}
                    value={v}
                    className="bg-[#0B0B12]"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Flag size={15} className="text-indigo-400" />
                Priority
              </label>

              <select
                {...register("priority")}
                className={selectCls}
              >
                {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                  <option
                    key={v}
                    value={v}
                    className="bg-[#0B0B12]"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Assignee */}
          <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <CalendarDays
                  size={15}
                  className="text-indigo-400"
                />
                Due Date
              </label>

              <input
                {...register("dueDate")}
                type="date"
                className={inputCls}
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <User2 size={15} className="text-indigo-400" />
                Assignee
              </label>

              <select
                {...register("assigneeId")}
                className={selectCls}
              >
                <option
                  value=""
                  className="bg-[#0B0B12]"
                >
                  Unassigned
                </option>

                {members.map((m) => (
                  <option
                    key={m.user.id}
                    value={m.user.id}
                    className="bg-[#0B0B12]"
                  >
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 border-t border-white/10 pt-6 max-[500px]:flex-col">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createTask.isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {createTask.isPending ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}