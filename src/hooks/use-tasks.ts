// src/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Task } from "@/types";

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => api.getTasks(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
   
  return useMutation({
    mutationFn: (data: Partial<Task> & { title: string }) => api.createTask(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Task created!" );
    },
    onError: (e: Error) =>
  toast.error("Something went wrong", {
    description: e.message,
  }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
      api.updateTask(projectId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
   
  return useMutation({
    mutationFn: (taskId: string) => api.deleteTask(projectId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted" );
    },
    onError: (e: Error) =>
  toast.error("Something went wrong", {
    description: e.message,
  }),
  });
}

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
}