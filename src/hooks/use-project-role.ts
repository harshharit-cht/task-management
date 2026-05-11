// src/hooks/use-project-role.ts
import { useSession } from "next-auth/react";
import type { Project } from "@/types";

export function useProjectRole(project: Project | undefined) {
  const { data: session } = useSession();

  if (!project || !session?.user?.id) {
    return { role: null, isAdmin: false, isMember: false };
  }

  const member = project.members.find((m) => m.user.id === session.user.id);
  const role   = member?.role ?? null;

  return {
    role,
    isAdmin:  role === "ADMIN",
    isMember: !!role,
  };
}