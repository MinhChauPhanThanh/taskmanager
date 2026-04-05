"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Paperclip,
  CheckSquare,
  GripVertical,
  Calendar,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { TaskWithRelations } from "@/types";

interface Props {
  task: TaskWithRelations;
  onEdit: () => void;
  isDragging?: boolean;
}

export function KanbanCard({ task, onEdit, isDragging = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkedCount = task.checklist.filter((c) => c.checked).length;
  const totalChecklist = task.checklist.length;
  const isOverdue =
    task.deadline &&
    isPast(new Date(task.deadline)) &&
    task.status !== "DONE";
  const isDueToday =
    task.deadline && isToday(new Date(task.deadline));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all",
        isSortableDragging && "opacity-40",
        isDragging && "shadow-xl"
      )}
      onClick={onEdit}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle mt-0.5 opacity-0 group-hover:opacity-40 hover:!opacity-100 text-muted-foreground shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="text-sm font-medium leading-snug line-clamp-2">
            {task.title}
          </p>

          {task.deadline && (
            <p
              className={cn(
                "text-xs mt-1.5 flex items-center gap-1",
                isOverdue
                  ? "text-destructive"
                  : isDueToday
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.deadline), "MMM d")}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-3 text-muted-foreground">
              {totalChecklist > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <CheckSquare className="h-3 w-3" />
                  {checkedCount}/{totalChecklist}
                </span>
              )}
              {task._count.comments > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  {task._count.comments}
                </span>
              )}
              {task._count.attachments > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <Paperclip className="h-3 w-3" />
                  {task._count.attachments}
                </span>
              )}
            </div>

            {task.assignee && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {(
                    task.assignee.name ?? task.assignee.email
                  )[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}