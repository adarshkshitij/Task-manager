import { TaskStatus, TaskPriority } from "@prisma/client";
import { clsx } from "clsx";
import { format, formatDistanceToNowStrict, isPast, isToday } from "date-fns";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDate(value?: Date | null) {
  if (!value) {
    return "No due date";
  }

  return format(value, "dd MMM yyyy");
}

export function getDueLabel(value?: Date | null) {
  if (!value) {
    return "No due date";
  }

  if (isToday(value)) {
    return "Due today";
  }

  if (isPast(value)) {
    return `Overdue by ${formatDistanceToNowStrict(value)}`;
  }

  return `Due in ${formatDistanceToNowStrict(value)}`;
}

export function getStatusClasses(status: TaskStatus) {
  switch (status) {
    case TaskStatus.DONE:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-[0_2px_10px_rgba(16,185,129,0.05)]";
    case TaskStatus.IN_PROGRESS:
      return "bg-amber-50 text-amber-700 border border-amber-200/50 shadow-[0_2px_10px_rgba(245,158,11,0.05)]";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200/80";
  }
}

export function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.HIGH:
      return "text-rose-600 bg-rose-50 border border-rose-100";
    case TaskPriority.MEDIUM:
      return "text-amber-600 bg-amber-50 border border-amber-100";
    case TaskPriority.LOW:
      return "text-emerald-600 bg-emerald-50 border border-emerald-100";
    default:
      return "text-slate-600 bg-slate-50 border border-slate-100";
  }
}
