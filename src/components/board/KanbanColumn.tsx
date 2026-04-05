"use client";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";
import type { TaskStatus } from "@prisma/client";

interface ColumnDef {
  id: TaskStatus;
  label: string;
  color: string;
}

interface Props {
  column: ColumnDef;
  tasks: TaskWithRelations[];
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", column.color)} />
          <h3 className="font-medium text-sm">{column.label}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-20 rounded-xl transition-colors p-1 space-y-2",
          isOver ? "bg-accent/60" : "bg-muted/30"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={onAddTask}
            className="w-full py-6 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}