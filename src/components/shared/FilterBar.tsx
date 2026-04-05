"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { TaskFilters, UserSummary } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  filters: TaskFilters;
  onFiltersChange: (f: TaskFilters) => void;
  members: UserSummary[];
}

export function FilterBar({ filters, onFiltersChange, members }: Props) {
  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.assigneeId ||
    filters.search;

  function clearFilters() {
    setSearch("");
    onFiltersChange({});
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 w-48 text-sm"
        />
      </div>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            status: v === "ALL" ? undefined : (v as any),
          })
        }
      >
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="TODO">To do</SelectItem>
          <SelectItem value="IN_PROGRESS">In progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? "ALL"}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            priority: v === "ALL" ? undefined : (v as any),
          })
        }
      >
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>

      {members.length > 0 && (
        <Select
          value={filters.assigneeId ?? "ALL"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              assigneeId: v === "ALL" ? undefined : v,
            })
          }
        >
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name ?? m.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={`${filters.sortBy ?? "order"}:${filters.sortDir ?? "asc"}`}
        onValueChange={(v) => {
          const [sortBy, sortDir] = v.split(":") as [
            TaskFilters["sortBy"],
            TaskFilters["sortDir"]
          ];
          onFiltersChange({ ...filters, sortBy, sortDir });
        }}
      >
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="order:asc">Default order</SelectItem>
          <SelectItem value="deadline:asc">Deadline (earliest)</SelectItem>
          <SelectItem value="deadline:desc">Deadline (latest)</SelectItem>
          <SelectItem value="priority:desc">Priority (high first)</SelectItem>
          <SelectItem value="createdAt:desc">Newest first</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}