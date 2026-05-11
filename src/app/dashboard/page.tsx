// src/app/dashboard/page.tsx
"use client";
import { useDashboard } from "@/hooks/use-tasks";
import { formatDate, isOverdue, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { TaskStatus } from "@prisma/client";
import {
  FolderKanban, CheckSquare, AlertTriangle,
  TrendingUp, Clock, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, overdueTasks, recentTasks, projects, tasksByStatus } = data!;
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
          {" "}{session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects"  value={stats.totalProjects}
          color="bg-indigo-500/10 text-indigo-400" />
        <StatCard icon={CheckSquare} label="Total Tasks"     value={stats.totalTasks}
          sub={`${completionRate}% complete`}
          color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={TrendingUp}  label="Completed"       value={stats.completedTasks}
          color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={AlertTriangle} label="Overdue"       value={stats.overdueCount}
          color="bg-red-500/10 text-red-400" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Task breakdown */}
        <div className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">My Tasks by Status</h2>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = tasksByStatus.find((t) => t.status === status)?._count ?? 0;
              const pct = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: status === "DONE" ? "#10b981"
                          : status === "IN_PROGRESS" ? "#3b82f6"
                          : status === "IN_REVIEW"   ? "#f59e0b" : "#64748b",
                      }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue tasks */}
        <div className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Overdue</h2>
            {overdueTasks.length > 0 && (
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                {overdueTasks.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {overdueTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm text-slate-600">No overdue tasks!</p>
              </div>
            ) : overdueTasks.map((task) => (
              <Link key={task.id} href={`/projects/${task.project.id}`}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600"
                      style={{ color: task.project.color }}>{task.project.name}</span>
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <Clock size={10} /> {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-2">
            {recentTasks.map((task) => {
              const s = STATUS_CONFIG[task.status];
              return (
                <Link key={task.id} href={`/projects/${task.project.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color} mt-0.5`}>
                    {s.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5"
                      style={{ color: task.project.color }}>{task.project.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Projects</h2>
          <Link href="/projects"
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project) => {
            const done  = project.tasks?.filter((t) => t.status === TaskStatus.DONE).length ?? 0;
            const total = project._count?.tasks ?? 0;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}
                className="bg-[#13131f] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 hover:bg-[#16162a] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: project.color + "33", color: project.color }}>
                      {project.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-600">{total} tasks</p>
                    </div>
                  </div>
                  <ArrowRight size={16}
                    className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>

                {project.description && (
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-slate-400 font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: project.color }} />
                  </div>
                </div>

                {/* Avatars */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((m) => (
                      <div key={m.user.id}
                        className="w-6 h-6 rounded-full bg-indigo-600/30 border-2 border-[#13131f] flex items-center justify-center text-[10px] font-semibold text-indigo-300">
                        {m.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#13131f] flex items-center justify-center text-[10px] text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-600">{done}/{total} done</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}