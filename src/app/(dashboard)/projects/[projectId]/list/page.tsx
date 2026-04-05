"use client";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { FilterBar } from "@/components/shared/FilterBar";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { TaskDialog } from "@/components/task/TaskDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Loader2, Calendar, Pencil } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import type { TaskFilters } from "@/types";
import { TaskStatus } from "@prisma/client";

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export default function ListPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const [filters, setFilters] = useState<TaskFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const { data: project } = useProject(projectId);
  const { data: tasks = [], isLoading } = useTasks(projectId, filters);
  const members = project?.memberships.map((m) => m.user) ?? [];

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          members={members}
        />
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No tasks found. Try adjusting your filters.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Title</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">
                  Priority
                </th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  Assignee
                </th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  Deadline
                </th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => {
                const overdue =
                  task.deadline &&
                  isPast(new Date(task.deadline)) &&
                  task.status !== "DONE";
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setEditTaskId(task.id)}
                  >
                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {STATUS_LABEL[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={task.assignee.image ?? undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {(
                                task.assignee.name ?? task.assignee.email
                              )[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {task.assignee.name ?? task.assignee.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 hidden lg:table-cell text-xs",
                        overdue ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {task.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.deadline), "MMM d, yyyy")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTaskId(task.id);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <TaskDialog
          projectId={projectId}
          members={members}
          onClose={() => setCreateOpen(false)}
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
