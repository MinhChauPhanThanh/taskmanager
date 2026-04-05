"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useState, useMemo, useCallback } from "react";
import { TaskStatus } from "@prisma/client";
import { useTasks } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { TaskDialog } from "@/components/task/TaskDialog";
import { Loader2 } from "lucide-react";
import type { TaskWithRelations, TaskFilters } from "@/types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: TaskStatus.TODO, label: "To do", color: "bg-slate-500" },
  { id: TaskStatus.IN_PROGRESS, label: "In progress", color: "bg-blue-500" },
  { id: TaskStatus.DONE, label: "Done", color: "bg-green-500" },
];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(
    null
  );
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(
    null
  );
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const { data: project } = useProject(projectId);
  const { data: tasks = [], isLoading } = useTasks(projectId, filters);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = useMemo(() => {
    const map: Record<TaskStatus, TaskWithRelations[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };
    for (const task of tasks) map[task.status].push(task);
    for (const status of Object.keys(map) as TaskStatus[]) {
      map[status].sort((a, b) => a.order - b.order);
    }
    return map;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const draggedTask = tasks.find((t) => t.id === active.id);
      if (!draggedTask) return;

      const overTask = tasks.find((t) => t.id === over.id);
      let targetStatus: TaskStatus;

      if (overTask) {
        targetStatus = overTask.status;
      } else if (
        Object.values(TaskStatus).includes(over.id as TaskStatus)
      ) {
        targetStatus = over.id as TaskStatus;
      } else {
        return;
      }

      if (draggedTask.status === targetStatus) return;

      await fetch(
        `/api/projects/${projectId}/tasks/${draggedTask.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetStatus, order: 9999 }),
        }
      );
    },
    [tasks, projectId]
  );

  const members = project?.memberships.map((m) => m.user) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        members={members}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columns[col.id]}
              onAddTask={() => setCreateInStatus(col.id)}
              onEditTask={setEditTaskId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="drag-overlay">
              <KanbanCard
                task={activeTask}
                onEdit={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {createInStatus && (
        <TaskDialog
          projectId={projectId}
          defaultStatus={createInStatus}
          members={members}
          onClose={() => setCreateInStatus(null)}
        />
      )}
      {editTaskId && (
        <TaskDialog
          projectId={projectId}
          taskId={editTaskId}
          members={members}
          onClose={() => setEditTaskId(null)}
        />
      )}
    </div>
  );
}