import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithMembers, CreateProjectInput } from "@/types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

export function useProjects() {
  return useQuery<ProjectWithMembers[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/projects"),
  });
}

export function useProject(projectId: string) {
  return useQuery<ProjectWithMembers>({
    queryKey: ["projects", projectId],
    queryFn: () => fetchJson(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      fetchJson("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateProjectInput>) =>
      fetchJson(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      fetch(`/api/projects/${projectId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useAddMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      fetchJson(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
}