export interface MessageAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: MessageAuthor;
  reactions: Reaction[];
  attachments: Attachment[];
  _count: { replies: number };
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

export interface TypingUser {
  userId: string;
  name: string;
}
