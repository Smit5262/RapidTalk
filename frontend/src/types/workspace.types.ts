export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type ChannelType = "PUBLIC" | "PRIVATE" | "DIRECT_MESSAGE" | "GROUP_DM";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    status: string;
  };
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  type: ChannelType;
  topic: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members?: Array<{ isPinned: boolean; isFavorite: boolean; lastReadAt: string | null }>;
}