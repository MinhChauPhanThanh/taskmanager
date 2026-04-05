"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTask,
} from "@/hooks/useTasks";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/lib/validations/task";
import { TaskStatus, Priority } from "@prisma/client";
import { ChecklistSection } from "./ChecklistSection";
import { CommentsSection } from "./CommentsSection";
import { AttachmentsSection } from "./AttachmentsSection";
import { useToast } from "@/components/ui/use-toast";
import type { UserSummary } from "@/types";

interface Props {
  projectId: string;
  taskId?: string;
  defaultStatus?: TaskStatus;
  members: UserSummary[];
  onClose: () => void;
}

export function TaskDialog({
  projectId,
  taskId,
  defaultStatus,
  members,
  onClose,
}: Props) {
  const { toast } = useToast();
  const isEdit = !!taskId;

  const { data: existingTask } = useTask(projectId, taskId ?? "");
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId, taskId ?? "");
  const deleteTask = useDeleteTask(projectId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: defaultStatus ?? TaskStatus.TODO,
      priority: Priority.MEDIUM,
    },
  });

  useEffect(() => {
    if (existingTask) {
      reset({
        title: existingTask.title,
        description: existingTask.description ?? "",
        status: existingTask.status,
        priority: existingTask.priority,
        deadline: existingTask.deadline
          ? new Date(existingTask.deadline).toISOString().slice(0, 16)
          : undefined,
        assigneeId: existingTask.assigneeId ?? undefined,
      });
    }
  }, [existingTask, reset]);

  async function onSubmit(data: CreateTaskInput) {
    try {
      if (isEdit) {
        await updateTask.mutateAsync(data);
        toast({ title: "Task updated" });
      } else {
        await createTask.mutateAsync(data);
        toast({ title: "Task created" });
      }
      onClose();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!taskId) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask.mutateAsync(taskId);
    toast({ title: "Task deleted" });
    onClose();
  }

  const priority = watch("priority");
  const status = watch("status");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setValue("priority", v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Assignee</Label>
              <Select
                value={watch("assigneeId") ?? "none"}
                onValueChange={(v) =>
                  setValue("assigneeId", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name ?? m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register("deadline")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete task
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isEdit ? "Save changes" : "Create task"}
              </Button>
            </div>
          </div>
        </form>

        {isEdit && taskId && (
          <div className="border-t pt-4 space-y-6">
            <ChecklistSection projectId={projectId} taskId={taskId} />
            <AttachmentsSection projectId={projectId} taskId={taskId} />
            <CommentsSection projectId={projectId} taskId={taskId} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}