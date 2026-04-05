"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useTask,
  useAddComment,
  useDeleteComment,
} from "@/hooks/useTasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  projectId: string;
  taskId: string;
}

export function CommentsSection({ projectId, taskId }: Props) {
  const { data: session } = useSession();
  const { data: task } = useTask(projectId, taskId);
  const [body, setBody] = useState("");
  const addComment = useAddComment(projectId, taskId);
  const deleteComment = useDeleteComment(projectId, taskId);

  const comments = task?.comments ?? [];

  async function handleSubmit() {
    const text = body.trim();
    if (!text) return;
    await addComment.mutateAsync(text);
    setBody("");
  }

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-1.5 mb-3">
        <MessageSquare className="h-4 w-4" />
        Comments
        {comments.length > 0 && (
          <span className="text-muted-foreground font-normal">
            {comments.length}
          </span>
        )}
      </h4>

      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 group">
            <Avatar className="h-7 w-7 shrink-0 mt-0.5">
              <AvatarImage src={c.author.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {(c.author.name ?? c.author.email)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">
                  {c.author.name ?? c.author.email}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(c.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm mt-0.5 whitespace-pre-wrap">{c.body}</p>
            </div>
            {session?.user?.id === c.author.id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground"
                onClick={() => deleteComment.mutate(c.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
              handleSubmit();
          }}
        />
        <Button
          size="icon"
          className="self-end shrink-0"
          onClick={handleSubmit}
          disabled={!body.trim() || addComment.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Ctrl+Enter to submit
      </p>
    </div>
  );
}