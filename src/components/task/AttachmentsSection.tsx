"use client";

import { useRef, useState } from "react";
import { useTask } from "@/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  projectId: string;
  taskId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsSection({ projectId, taskId }: Props) {
  const { data: task } = useTask(projectId, taskId);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const attachments = task?.attachments ?? [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/attachments`,
        { method: "POST", body: form }
      );
      if (!res.ok) {
        const json = await res.json();
        toast({
          title: json.error ?? "Upload failed",
          variant: "destructive",
        });
      } else {
        qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(attachmentId: string) {
    const res = await fetch(
      `/api/projects/${projectId}/tasks/${taskId}/attachments?attachmentId=${attachmentId}`,
      { method: "DELETE" }
    );
    if (res.ok) qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Paperclip className="h-4 w-4" />
          Attachments
          {attachments.length > 0 && (
            <span className="text-muted-foreground font-normal">
              {attachments.length}
            </span>
          )}
        </h4>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <Upload className="h-3.5 w-3.5 mr-1" />
          )}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="space-y-2">
        {attachments.map((a) => {
          const isImage = a.mimeType.startsWith("image/");
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 p-2 rounded-lg border group"
            >
              <div className="text-muted-foreground shrink-0">
                {isImage ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {a.originalName}
                </a>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(a.size)} &middot;{" "}
                  {formatDistanceToNow(new Date(a.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0"
                onClick={() => handleDelete(a.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}