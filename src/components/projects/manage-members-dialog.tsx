// src/components/projects/manage-members-dialog.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, Crown, User, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAddMember, useRemoveMember, useUpdateMemberRole } from "@/hooks/use-members";
import { useSession } from "next-auth/react";
import type { Project, ProjectMember } from "@/types";
import { Role } from "@prisma/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project;
  isAdmin: boolean;
}

function MemberRow({
  member, isAdmin, isSelf, projectId,
}: {
  member: ProjectMember;
  isAdmin: boolean;
  isSelf: boolean;
  projectId: string;
}) {
  const removeMember = useRemoveMember(projectId);
  const updateRole = useUpdateMemberRole(projectId);
  const [confirm, setConfirm] = useState(false);

  const toggleRole = () => {
    const newRole = member.role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
    updateRole.mutate({ memberId: member.id, role: newRole });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center text-sm font-semibold text-indigo-300 flex-shrink-0">
        {member.user.name?.[0]?.toUpperCase() ?? "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {member.user.name}
          </span>
          {isSelf && (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full">
              you
            </span>
          )}
        </div>
        <span className="text-xs text-slate-600 truncate">{member.user.email}</span>
      </div>

      {/* Role badge */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${member.role === Role.ADMIN
          ? "bg-amber-500/10 text-amber-400"
          : "bg-slate-500/10 text-slate-400"
        }`}>
        {member.role === Role.ADMIN
          ? <><Crown size={10} /> Admin</>
          : <><User size={10} /> Member</>
        }
      </div>

      {/* Admin actions */}
      {isAdmin && !isSelf && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={toggleRole}
            title={member.role === Role.ADMIN ? "Demote to Member" : "Promote to Admin"}
            disabled={updateRole.isPending}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
            <Shield size={13} />
          </button>

          {!confirm ? (
            <button onClick={() => setConfirm(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={13} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => removeMember.mutate(member.id)}
                disabled={removeMember.isPending}
                className="text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded-lg transition-all">
                {removeMember.isPending ? <Loader2 size={10} className="animate-spin" /> : "Remove"}
              </button>
              <button onClick={() => setConfirm(false)}
                className="text-[11px] bg-white/5 text-slate-400 hover:bg-white/10 px-2 py-1 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ManageMembersDialog({ open, onOpenChange, project, isAdmin }: Props) {
  const { data: session } = useSession();
  const addMember = useAddMember(project.id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.MEMBER },
  });

  const onSubmit = async (data: FormData) => {
    await addMember.mutateAsync(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Team Members
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Manage project members and their access roles.
          </DialogDescription>
        </DialogHeader>

        {/* Add member — admin only */}
        {isAdmin && (
          <form onSubmit={handleSubmit(onSubmit)}
            className="flex gap-2 mt-2 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <div className="flex-1 space-y-1">
              <input {...register("email")} type="email" placeholder="colleague@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
              {errors.email && (
                <p className="text-red-400 text-xs px-1">{errors.email.message}</p>
              )}
            </div>

            <select {...register("role")}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer">
              <option value={Role.MEMBER} className="bg-[#13131f]">Member</option>
              <option value={Role.ADMIN} className="bg-[#13131f]">Admin</option>
            </select>

            <button type="submit" disabled={addMember.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 transition-all flex items-center gap-2 text-sm font-medium">
              {addMember.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <UserPlus size={14} />
              }
              Add
            </button>
          </form>
        )}

        {/* Members list */}
        <div className="space-y-1 max-h-80 overflow-y-auto mt-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 pb-2">
            {project.members.length} {project.members.length === 1 ? "member" : "members"}
          </p>
          {project.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              isSelf={member.user.id === session?.user?.id}
              projectId={project.id}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}