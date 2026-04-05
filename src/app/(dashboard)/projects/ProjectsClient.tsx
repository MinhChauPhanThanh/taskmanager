"use client";
import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";

export function ProjectsClient() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects?.length ?? 0} project
            {projects?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-medium">No projects yet</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first project to get started.
          </p>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}