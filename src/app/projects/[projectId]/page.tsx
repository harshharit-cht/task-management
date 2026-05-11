// src/app/projects/[projectId]/page.tsx
"use client";
import { use, useState } from "react";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { Plus, Settings, Users, LayoutGrid } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { STATUS_CONFIG } from "@/lib/utils";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const [createOpen, setCreateOpen] = useState(false);

  if (projectLoading || tasksLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-10 w-72 bg-white/5 rounded-xl animate-pulse" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-72 h-96 bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return (
    <div className="p-8 text-slate-500">Project not found.</div>
  );

  const stats = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    ...config, status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: project.color + "22", color: project.color }}>
            {project.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-slate-500 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-2 mr-2">
            {project.members.slice(0, 5).map((m) => (
              <div key={m.user.id}
                className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-indigo-600/30 flex items-center justify-center text-xs font-semibold text-indigo-300"
                title={m.user.name ?? ""}>
                {m.user.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3">
        {stats.map(({ status, label, color, bg, count }) => (
          <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${bg} border-white/5`}>
            <span className={`text-xs font-semibold ${color}`}>{label}</span>
            <span className={`text-sm font-bold ${color}`}>{count}</span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <KanbanBoard tasks={tasks} projectId={projectId} members={project.members} />

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        members={project.members}
        defaultStatus={TaskStatus.TODO}
      />
    </div>
  );
}