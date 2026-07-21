export type NotificationType =
  | "MENTION"
  | "DIRECT_MESSAGE"
  | "WORKSPACE_INVITE"
  | "CHANNEL_ACTIVITY"
  | "AI_DIGEST"
  | "SYSTEM";

export interface WorkspaceInvitePayload {
  inviteToken: string;
  workspaceId: string;
  workspaceName: string;
  invitedByName: string;
}

export interface MentionPayload {
  messageId: string;
  channelId: string;
  workspaceId: string;
  mentionedByName: string;
  content: string;
}

export interface Notification {
  id: string;
  userId: string;
  workspaceId: string | null;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  notifications: Notification[];
  hasMore: boolean;
}
