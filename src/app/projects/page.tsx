// src/app/projects/page.tsx
"use client";
import { useState } from "react";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Plus, FolderKanban, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TaskStatus } from "@prisma/client";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-500 mt-1">{projects?.length ?? 0} projects total</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban size={28} className="text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-300">No projects yet</h2>
          <p className="text-slate-600 mt-1 mb-6">Create your first project to get started</p>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects!.map((project) => {
            const total = project._count?.tasks ?? 0;
            const done  = project.tasks?.filter((t) => t.status === TaskStatus.DONE).length ?? 0;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={project.id}
                className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all group relative">
                {/* Color bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ backgroundColor: project.color }} />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                      style={{ backgroundColor: project.color + "22", color: project.color }}>
                      {project.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-xs text-slate-600">{project.members.length} members · {total} tasks</p>
                    </div>
                  </div>
                  <button onClick={() => deleteProject.mutate(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: project.color }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {project.members.slice(0, 5).map((m) => (
                      <div key={m.user.id}
                        className="w-7 h-7 rounded-full border-2 border-[#13131f] bg-indigo-600/30 flex items-center justify-center text-[11px] font-semibold text-indigo-300">
                        {m.user.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <Link href={`/projects/${project.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                    Open <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}