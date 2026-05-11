// src/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
}

export function useProject(id: string) {
  return useQuery({ queryKey: ["projects", id], queryFn: () => api.getProject(id), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
   
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!" );
    },
   onError: (e: Error) =>
  toast.error("Something went wrong", {
    description: e.message,
  }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
   
  return useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted" );
    },
   onError: (e: Error) =>
  toast.error("Something went wrong", {
    description: e.message,
  }),
  });
}