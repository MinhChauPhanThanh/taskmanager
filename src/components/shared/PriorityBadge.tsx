import { cn } from "@/lib/utils";
import type { Priority } from "@prisma/client";

const config: Record<Priority, { label: string; className: string }> = {
  HIGH: {
    label: "High",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  LOW: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority];
  return (
    <span
      className={cn(
        "inline-flex text-xs font-medium px-1.5 py-0.5 rounded-full",
        className
      )}
    >
      {label}
    </span>
  );
}