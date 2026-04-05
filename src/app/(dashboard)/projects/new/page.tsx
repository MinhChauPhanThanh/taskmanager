"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import { useCreateProject } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#64748b",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { color: "#6366f1" },
  });

  const selectedColor = watch("color");

  async function onSubmit(data: CreateProjectInput) {
    try {
      const project = (await createProject.mutateAsync(data)) as any;
      toast({ title: "Project created!" });
      router.push(`/projects/${project.id}`);
    } catch {
      toast({ title: "Failed to create project", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/projects"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>
      <h1 className="text-2xl font-semibold mb-6">New project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="name">Project name</Label>
          <Input
            id="name"
            placeholder="My awesome project"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="What is this project about?"
            rows={3}
            {...register("description")}
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue("color", color)}
                className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: color,
                  outline:
                    selectedColor === color
                      ? `2px solid ${color}`
                      : "2px solid transparent",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Create project
        </Button>
      </form>
    </div>
  );
}