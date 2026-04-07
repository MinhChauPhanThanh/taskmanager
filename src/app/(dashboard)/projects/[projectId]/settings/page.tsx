"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useProject, useAddMember } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  LEADER: "Leader",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export default function SettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { data: session } = useSession();
  const { data: project } = useProject(params.projectId);
  const { toast } = useToast();
  const addMember = useAddMember(params.projectId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.MEMBER);

  const myMembership = project?.memberships.find(
    (m) => m.user.id === session?.user?.id
  );
  const isLeader = myMembership?.role === Role.LEADER;

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addMember.mutateAsync({ email, role });
      toast({ title: "Member added" });
      setEmail("");
    } catch (err: any) {
      toast({
        title: err.message ?? "Failed to add member",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-base font-semibold mb-4">Members</h2>
        <div className="space-y-3 mb-6">
          {project?.memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={m.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(m.user.name ?? m.user.email)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {m.user.name ?? m.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.user.email}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {ROLE_LABELS[m.role]}
              </span>
            </div>
          ))}
        </div>

        {isLeader && (
          <form
            onSubmit={handleAddMember}
            className="border rounded-lg p-4 space-y-3"
          >
            <h3 className="text-sm font-medium">Invite member</h3>
            <div className="space-y-1">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.LEADER}>
                    Leader — full access
                  </SelectItem>
                  <SelectItem value={Role.MEMBER}>
                    Member — create & edit own tasks
                  </SelectItem>
                  <SelectItem value={Role.VIEWER}>
                    Viewer — read only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={addMember.isPending}>
              {addMember.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Send invite
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}