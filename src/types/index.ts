export type { TaskStatus, Priority, Role } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: import("@prisma/client").TaskStatus;
  priority: import("@prisma/client").Priority;
  deadline: string | null;
  order: number;
  projectId: string;
  creatorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: UserSummary | null;
  creator: UserSummary;
  checklist: ChecklistItemData[];
  comments: CommentWithAuthor[];
  attachments: AttachmentData[];
  _count: { comments: number; checklist: number; attachments: number };
}

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface ChecklistItemData {
  id: string;
  taskId: string;
  text: string;
  checked: boolean;
  order: number;
  createdAt: string;
}

export interface CommentWithAuthor {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary;
}

export interface AttachmentData {
  id: string;
  taskId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface ProjectWithMembers {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  memberships: MembershipWithUser[];
  _count: { tasks: number };
}

export interface MembershipWithUser {
  id: string;
  role: import("@prisma/client").Role;
  joinedAt: string;
  user: UserSummary;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export interface TaskFilters {
  search?: string;
  status?: import("@prisma/client").TaskStatus | "ALL";
  priority?: import("@prisma/client").Priority | "ALL";
  assigneeId?: string | "ALL";
  sortBy?: "deadline" | "priority" | "createdAt";
  sortDir?: "asc" | "desc";
}