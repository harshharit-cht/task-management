// src/components/layout/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Plus,
  LogOut, Settings, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { useState } from "react";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: projects } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects",  label: "Projects",  icon: FolderKanban },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}>
              <Icon size={17} />
              {label}
            </Link>
          ))}

          {/* Projects section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Projects</span>
              <button onClick={() => setCreateOpen(true)}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all">
                <Plus size={13} />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects?.slice(0, 8).map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group",
                    pathname === `/projects/${project.id}`
                      ? "bg-white/8 text-slate-200"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  )}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }} />
                  <span className="truncate">{project.name}</span>
                  <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}

              {!projects?.length && (
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-600">No projects yet</p>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-all group">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0 text-indigo-400 text-sm font-semibold">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-300 truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-600 truncate">{session?.user?.email}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}