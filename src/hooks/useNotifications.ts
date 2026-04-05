import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationData } from "@/types";

export function useNotifications() {
  return useQuery<NotificationData[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => {
      const url = id
        ? `/api/notifications?id=${id}`
        : "/api/notifications";
      return fetch(url, { method: "PATCH" });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}