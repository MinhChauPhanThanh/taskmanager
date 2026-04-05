"use client";
import { useState } from "react";
import {
  useTask,
  useAddChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
} from "@/hooks/useTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, CheckSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  projectId: string;
  taskId: string;
}

export function ChecklistSection({ projectId, taskId }: Props) {
  const { data: task } = useTask(projectId, taskId);
  const [newText, setNewText] = useState("");
  const addItem = useAddChecklistItem(projectId, taskId);
  const toggleItem = useToggleChecklistItem(projectId, taskId);
  const deleteItem = useDeleteChecklistItem(projectId, taskId);

  const items = task?.checklist ?? [];
  const checked = items.filter((i) => i.checked).length;
  const progress =
    items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

  async function handleAdd() {
    const text = newText.trim();
    if (!text) return;
    await addItem.mutateAsync(text);
    setNewText("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4" />
          Checklist
          {items.length > 0 && (
            <span className="text-muted-foreground font-normal">
              {checked}/{items.length}
            </span>
          )}
        </h4>
      </div>

      {items.length > 0 && (
        <Progress value={progress} className="h-1 mb-3" />
      )}

      <div className="space-y-1.5 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) =>
                toggleItem.mutate({
                  itemId: item.id,
                  checked: !!checked,
                })
              }
            />
            <label
              htmlFor={item.id}
              className={`flex-1 text-sm cursor-pointer ${
                item.checked ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.text}
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
              onClick={() => deleteItem.mutate(item.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add checklist item..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-8 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!newText.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}