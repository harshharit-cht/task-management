// src/hooks/use-members.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function useAddMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role?: string }) =>
      api.addMember(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Member added successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => api.removeMember(projectId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Member removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMemberRole(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.updateMemberRole(projectId, memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}