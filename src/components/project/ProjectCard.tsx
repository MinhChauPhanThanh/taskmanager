"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProjectWithMembers } from "@/types";

export function ProjectCard({ project }: { project: ProjectWithMembers }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full flex flex-col">
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1">
          <h2 className="font-semibold text-base mt-1 group-hover:text-primary transition-colors line-clamp-1">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>
              {project._count.tasks} task
              {project._count.tasks !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex -space-x-2">
            {project.memberships.slice(0, 4).map((m) => (
              <Avatar key={m.user.id} className="h-6 w-6 border-2 border-card">
                <AvatarImage src={m.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {(m.user.name ?? m.user.email)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.memberships.length > 4 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                +{project.memberships.length - 4}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Updated{" "}
          {formatDistanceToNow(new Date(project.updatedAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </Link>
  );
}