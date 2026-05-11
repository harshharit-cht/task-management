// src/components/projects/create-project-dialog.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/use-projects";
import { PROJECT_COLORS } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const createProject = useCreateProject();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createProject.mutateAsync({ ...data, color });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project name</label>
            <input {...register("name")} placeholder="e.g. Website Redesign"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description <span className="text-slate-600">(optional)</span></label>
            <textarea {...register("description")} placeholder="What is this project about?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" />
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl py-3 text-sm font-medium transition-all">
              Cancel
            </button>
            <button type="submit" disabled={createProject.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
              {createProject.isPending && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}