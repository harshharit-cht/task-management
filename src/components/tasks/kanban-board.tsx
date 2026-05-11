// src/components/tasks/kanban-board.tsx
"use client";
import { useState } from "react";
import { TaskStatus } from "@prisma/client";
import { Plus } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Task, ProjectMember } from "@/types";

interface Props {
  tasks: Task[];
  projectId: string;
  members: ProjectMember[];
}

export function KanbanBoard({ tasks, projectId, members }: Props) {
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask(projectId);

  const columns = Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG[TaskStatus]][];

  return (
    <>
      <div className="flex gap-4 max overflow-x-auto pb-4">
        {columns.map(([status, config]) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className={`flex items-center justify-between mb-3 px-1`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
                    {columnTasks.length}
                  </span>
                </div>
                <button onClick={() => setCreateStatus(status)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all">
                  <Plus size={14} />
                </button>
              </div>

              {/* Cards */}
              <div className={`min-h-[200px] rounded-2xl p-2 space-y-2 border ${config.border} bg-white/[0.02]`}>
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-xs text-slate-700">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskDialog
        open={!!createStatus}
        onOpenChange={(v) => !v && setCreateStatus(null)}
        projectId={projectId}
        members={members}
        defaultStatus={createStatus ?? TaskStatus.TODO}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(v) => !v && setSelectedTask(null)}
        projectId={projectId}
        members={members}
      />
    </>
  );
}