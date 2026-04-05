"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { LayoutGrid, ListTodo, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Sidebar() {
  const pathname = usePathname();
  const { data: projects, isLoading } = useProjects();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-card h-full">
      <div className="px-4 h-14 flex items-center border-b">
        <Link
          href="/projects"
          className="flex items-center gap-2 font-semibold text-sm"
        >
          <ListTodo className="h-5 w-5 text-primary" />
          TaskManager
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <Link href="/projects">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              pathname === "/projects"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Projects
          </div>
        </Link>

        <div className="pt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </span>
            <Link href="/projects/new">
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 mx-2 my-1 rounded" />
              ))
            : projects?.map((project) => {
                const isActive = pathname.startsWith(
                  `/projects/${project.id}`
                );
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </nav>

      <div className="border-t p-2">
        <Link href="/settings">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              pathname === "/settings"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </Link>
      </div>
    </aside>
  );
}