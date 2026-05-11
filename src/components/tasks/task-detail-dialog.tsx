// src/components/tasks/task-detail-dialog.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    formatDate,
    isOverdue,
} from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@prisma/client";
import {
    Clock,
    Send,
    Trash2,
    Loader2,
    AlertCircle,
    CalendarDays,
    User2,
    Flag,
    MessageSquare,
} from "lucide-react";
import type { Task, ProjectMember } from "@/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Props {
    task: Task | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    projectId: string;
    members: ProjectMember[];
    isAdmin: boolean;
}

export function TaskDetailDialog({
    task,
    open,
    onOpenChange,
    projectId,
    members,
    isAdmin
}: Props) {
    const [comment, setComment] = useState("");
    const qc = useQueryClient();
  const { data: session } = useSession();


    const updateTask = useUpdateTask(projectId);
    const deleteTask = useDeleteTask(projectId);

    const { data: fullTask } = useQuery({
        queryKey: ["task", task?.id],
        queryFn: () => api.getTask(projectId, task!.id),
        enabled: !!task?.id && open,
    });

    const addComment = useMutation({
        mutationFn: (content: string) =>
            api.addComment(projectId, task!.id, content),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["task", task?.id] });
            setComment("");
        },

        onError: (e: Error) =>
            toast.error("Something went wrong", {
                description: e.message,
            }),
    });

    if (!task) return null;

    const displayed = fullTask ?? task;
    const overdue = isOverdue(displayed.dueDate, displayed.status);

    const handleStatusChange = (status: TaskStatus) =>
        updateTask.mutate({
            taskId: task.id,
            data: { status },
        });

    const handleDelete = async () => {
        await deleteTask.mutateAsync(task.id);
        onOpenChange(false);
    };
     const canDelete = isAdmin || displayed.creator?.id === session?.user?.id;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border border-white/10 bg-[#0B0B12] p-0 text-white overflow-hidden max-w-5xl w-[96vw] rounded-3xl shadow-2xl">
                <DialogTitle className="hidden">
                    {displayed.title}
                </DialogTitle>

                <DialogDescription className="hidden">
                    Task details dialog
                </DialogDescription>

                <div className="flex max-[900px]:flex-col max-h-[92vh] overflow-hidden">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Header */}
                        <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-8 py-7">
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-5 flex-1">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div
                                                className={`h-2.5 w-2.5 rounded-full ${displayed.status === "DONE"
                                                        ? "bg-emerald-400"
                                                        : displayed.status === "IN_PROGRESS"
                                                            ? "bg-blue-400"
                                                            : displayed.status === "IN_REVIEW"
                                                                ? "bg-amber-400"
                                                                : "bg-slate-500"
                                                    }`}
                                            />

                                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                                                Task Details
                                            </span>
                                        </div>

                                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
                                            {displayed.title}
                                        </h2>

                                        {displayed.description ? (
                                            <p className="max-w-3xl text-[15px] leading-7 text-slate-400">
                                                {displayed.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-slate-600">
                                                No description added for this task.
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Tabs */}
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(s as TaskStatus)}
                                                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${displayed.status === s
                                                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-lg`
                                                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                                    }`}
                                            >
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {canDelete && (
                                    <button onClick={handleDelete}
                                        className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="px-8 py-7">
                            <div className="mb-5 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <MessageSquare size={17} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-white">
                                        Comments
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        {fullTask?.comments?.length ?? 0} discussion messages
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                                {fullTask?.comments?.length ? (
                                    fullTask.comments.map((c) => (
                                        <div
                                            key={c.id}
                                            className="group rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.045]"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 text-sm font-semibold text-indigo-200">
                                                    {c.author.name?.[0]?.toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <span className="font-medium text-white">
                                                            {c.author.name}
                                                        </span>

                                                        <span className="text-xs text-slate-600">
                                                            •
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            {formatDate(c.createdAt)}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm leading-7 text-slate-400">
                                                        {c.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
                                        <p className="text-sm text-slate-500">
                                            No comments yet
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="mt-6 flex gap-3">
                                <input
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && comment.trim()) {
                                            addComment.mutate(comment.trim());
                                        }
                                    }}
                                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10"
                                />

                                <button
                                    onClick={() =>
                                        comment.trim() &&
                                        addComment.mutate(comment.trim())
                                    }
                                    disabled={!comment.trim() || addComment.isPending}
                                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
                                >
                                    {addComment.isPending ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            Send
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-[320px] border-l border-white/10 bg-white/[0.02] p-7 max-[900px]:w-full max-[900px]:border-l-0 max-[900px]:border-t">
                        <div className="space-y-6">
                            <div>
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                                    Task Info
                                </p>

                                <div className="space-y-5">
                                    {/* Priority */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                        <div className="mb-3 flex items-center gap-2 text-slate-500">
                                            <Flag size={15} />
                                            <span className="text-xs font-medium uppercase tracking-wide">
                                                Priority
                                            </span>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold ${PRIORITY_CONFIG[displayed.priority].bg
                                                } ${PRIORITY_CONFIG[displayed.priority].color}`}
                                        >
                                            {PRIORITY_CONFIG[displayed.priority].label}
                                        </span>
                                    </div>

                                    {/* Assignee */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                        <div className="mb-3 flex items-center gap-2 text-slate-500">
                                            <User2 size={15} />
                                            <span className="text-xs font-medium uppercase tracking-wide">
                                                Assignee
                                            </span>
                                        </div>

                                        {displayed.assignee ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                                                    {displayed.assignee.name?.[0]?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-white">
                                                        {displayed.assignee.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Assigned member
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No assignee
                                            </p>
                                        )}
                                    </div>

                                    {/* Due Date */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                        <div className="mb-3 flex items-center gap-2 text-slate-500">
                                            <CalendarDays size={15} />
                                            <span className="text-xs font-medium uppercase tracking-wide">
                                                Due Date
                                            </span>
                                        </div>

                                        {displayed.dueDate ? (
                                            <div
                                                className={`flex items-center gap-2 text-sm font-medium ${overdue
                                                        ? "text-red-400"
                                                        : "text-slate-300"
                                                    }`}
                                            >
                                                {overdue && <AlertCircle size={15} />}
                                                <Clock size={15} />

                                                {formatDate(displayed.dueDate)}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No due date
                                            </p>
                                        )}
                                    </div>

                                    {/* Created By */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Created By
                                        </p>

                                        <p className="text-sm font-medium text-slate-300">
                                            {displayed.creator.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}