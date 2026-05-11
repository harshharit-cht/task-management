// src/app/projects/[projectId]/page.tsx
"use client";
import { use, useState } from "react";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectRole } from "@/hooks/use-project-role";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { ManageMembersDialog } from "@/components/projects/manage-members-dialog";
import { ProjectSettingsDialog } from "@/components/projects/project-settings-dialog";
import { Plus, Users, Settings } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { STATUS_CONFIG } from "@/lib/utils";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading: pLoading } = useProject(projectId);
  const { data: tasks = [],   isLoading: tLoading } = useTasks(projectId);
  const { isAdmin } = useProjectRole(project);

  const [createOpen,  setCreateOpen]  = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (pLoading || tLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-12 w-80 bg-white/5 rounded-2xl animate-pulse" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-72 h-96 bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-8 text-slate-500">Project not found.</div>;

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {isAdmin && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  Admin
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-slate-500 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-2 mr-1">
            {project.members.slice(0, 5).map((m) => (
              <div key={m.user.id}
                title={m.user.name ?? ""}
                className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-indigo-600/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                {m.user.name?.[0]?.toUpperCase()}
              </div>
            ))}
            {project.members.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-white/10 flex items-center justify-center text-xs text-slate-400">
                +{project.members.length - 5}
              </div>
            )}
          </div>

          {/* Members button — visible to all */}
          <button onClick={() => setMembersOpen(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Users size={15} />
            <span className="hidden sm:inline">Members</span>
          </button>

          {/* Settings — admin only */}
          {isAdmin && (
            <button onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2.5 rounded-xl text-sm font-medium transition-all">
              <Settings size={15} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          {/* Add task — all members */}
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-3 flex-wrap">
        {stats.map(({ status, label, color, bg, count }) => (
          <div key={status}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/[0.02] border-white/5`}>
            <div className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: status === "DONE" ? "#10b981"
                  : status === "IN_PROGRESS" ? "#3b82f6"
                  : status === "IN_REVIEW"   ? "#f59e0b" : "#64748b",
              }} />
            <span className={`text-xs font-medium ${color}`}>{label}</span>
            <span className={`text-sm font-bold ${color}`}>{count}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02]">
          <span className="text-xs font-medium text-slate-500">Total</span>
          <span className="text-sm font-bold text-slate-300">{tasks.length}</span>
        </div>
      </div>

      {/* Kanban */}
      <KanbanBoard tasks={tasks} projectId={projectId} members={project.members} isAdmin={isAdmin} />

      {/* Dialogs */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        members={project.members}
        defaultStatus={TaskStatus.TODO}
      />

      <ManageMembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        project={project}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <ProjectSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          project={project}
        />
      )}
    </div>
  );
}