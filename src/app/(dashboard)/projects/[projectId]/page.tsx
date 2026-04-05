import { KanbanBoard } from "@/components/board/KanbanBoard";

export default function KanbanPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <KanbanBoard projectId={params.projectId} />;
}