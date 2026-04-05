import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskWithRelations, TaskFilters, CreateTaskInput } from "@/types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

function buildTasksUrl(projectId: string, filters?: TaskFilters): string {
  const base = `/api/projects/${projectId}/tasks`;
  if (!filters) return base;
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "ALL")
    params.set("status", filters.status);
  if (filters.priority && filters.priority !== "ALL")
    params.set("priority", filters.priority);
  if (filters.assigneeId && filters.assigneeId !== "ALL")
    params.set("assigneeId", filters.assigneeId);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function useTasks(projectId: string, filters?: TaskFilters) {
  return useQuery<TaskWithRelations[]>({
    queryKey: ["tasks", projectId, filters],
    queryFn: () => fetchJson(buildTasksUrl(projectId, filters)),
    enabled: !!projectId,
  });
}

export function useTask(projectId: string, taskId: string) {
  return useQuery<TaskWithRelations>({
    queryKey: ["tasks", projectId, taskId],
    queryFn: () =>
      fetchJson(`/api/projects/${projectId}/tasks/${taskId}`),
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      fetchJson(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useUpdateTask(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateTaskInput> & { order?: number }) =>
      fetchJson(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useAddChecklistItem(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      fetchJson(
        `/api/projects/${projectId}/tasks/${taskId}/checklist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useToggleChecklistItem(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      checked,
    }: {
      itemId: string;
      checked: boolean;
    }) =>
      fetchJson(
        `/api/projects/${projectId}/tasks/${taskId}/checklist?itemId=${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked }),
        }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useDeleteChecklistItem(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetch(
        `/api/projects/${projectId}/tasks/${taskId}/checklist?itemId=${itemId}`,
        { method: "DELETE" }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useAddComment(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      fetchJson(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useDeleteComment(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      fetch(
        `/api/projects/${projectId}/tasks/${taskId}/comments?commentId=${commentId}`,
        { method: "DELETE" }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}