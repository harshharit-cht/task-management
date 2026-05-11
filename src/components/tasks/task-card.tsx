// src/components/tasks/task-card.tsx
"use client";
import { Task } from "@/types";
import { formatDate, isOverdue, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { MessageSquare, Clock, AlertCircle } from "lucide-react";

interface Props {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: Props) {
  const overdue  = isOverdue(task.dueDate, task.status);
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div onClick={onClick}
      className="bg-[#1a1a2e] border border-white/[0.06] rounded-xl p-4 cursor-pointer hover:border-white/10 hover:bg-[#1e1e35] transition-all group space-y-3">

      {/* Priority + tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>
        {task.tags.slice(0, 2).map(({ tag }) => (
          <span key={tag.id}
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: tag.color + "22", color: tag.color }}>
            {tag.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors leading-snug">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Assignee avatar */}
          {task.assignee && (
            <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] font-semibold text-indigo-300"
              title={task.assignee.name ?? ""}>
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Comments */}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <MessageSquare size={11} /> {task._count!.comments}
            </span>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[11px] font-medium ${
            overdue ? "text-red-400" : "text-slate-600"
          }`}>
            {overdue && <AlertCircle size={11} />}
            <Clock size={10} />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}