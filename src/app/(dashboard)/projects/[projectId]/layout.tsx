"use client";
import { useProject } from "@/hooks/useProjects";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const pathname = usePathname();
  const { data: project, isLoading } = useProject(params.projectId);

  const tabs = [
    {
      href: `/projects/${params.projectId}`,
      label: "Board",
      icon: LayoutGrid,
      exact: true,
    },
    {
      href: `/projects/${params.projectId}/list`,
      label: "List",
      icon: List,
      exact: false,
    },
    {
      href: `/projects/${params.projectId}/settings`,
      label: "Settings",
      icon: Settings2,
      exact: false,
    },
  ];

  return (
    <div className="flex flex-col h-full gap-0">
      <div className="mb-0 shrink-0">
        {isLoading ? (
          <Skeleton className="h-8 w-48 mb-2" />
        ) : (
          <div className="flex items-center gap-3 mb-3">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: project?.color }}
            />
            <h1 className="text-xl font-semibold truncate">{project?.name}</h1>
          </div>
        )}
        <div className="flex gap-1 border-b">
          {tabs.map((tab) => {
            const active =
              tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href) &&
                  pathname !== `/projects/${params.projectId}`;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
                  active
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-hidden pt-4">{children}</div>
    </div>
  );
}