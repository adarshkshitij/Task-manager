import { TaskStatus } from "@prisma/client";
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
      return "bg-emerald-100 text-emerald-700";
    case TaskStatus.IN_PROGRESS:
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}
