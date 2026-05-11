// src/components/projects/project-settings-dialog.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { PROJECT_COLORS } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project;
}

export function ProjectSettingsDialog({ open, onOpenChange, project }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [color, setColor] = useState(project.color);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: project.name, description: project.description ?? "" },
  });

  const updateProject = useMutation({
    mutationFn: (data: FormData) => api.updateProject(project.id, { ...data, color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Project updated");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: () => api.deleteProject(project.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      router.push("/projects");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setDeleteConfirm(false); }}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Project Settings
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Update project preferences and configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => updateProject.mutate(d))} className="space-y-5 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project name</label>
            <input {...register("name")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea {...register("description")} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }} />
              ))}
            </div>
          </div>

          <button type="submit"
            disabled={updateProject.isPending || (!isDirty && color === project.color)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
            {updateProject.isPending && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </form>

        {/* Danger zone */}
        <div className="border-t border-white/[0.06] pt-5 mt-2 space-y-3">
          <p className="text-xs font-semibold text-red-500/70 uppercase tracking-wider">Danger Zone</p>

          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 text-sm font-medium transition-all">
              <Trash2 size={14} /> Delete this project
            </button>
          ) : (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">
                  This will permanently delete <strong>{project.name}</strong> and all its tasks. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl py-2 text-sm transition-all">
                  Cancel
                </button>
                <button onClick={() => deleteProject.mutate()} disabled={deleteProject.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl py-2 text-sm font-medium transition-all flex items-center justify-center gap-2">
                  {deleteProject.isPending
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}