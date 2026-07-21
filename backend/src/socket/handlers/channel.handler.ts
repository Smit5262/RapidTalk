import { Socket } from "socket.io";
import { prisma } from "../../config/database";

interface JoinPayload {
  workspaceId: string;
  channelId: string;
}

async function canAccessChannel(userId: string, workspaceId: string, channelId: string): Promise<boolean> {
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!workspaceMember) return false;

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel || channel.workspaceId !== workspaceId || channel.isArchived) return false;

  if (channel.type === "PUBLIC") return true;

  const channelMember = await prisma.channelMember.findUnique({
    where: { channelId_workspaceMemberId: { channelId, workspaceMemberId: workspaceMember.id } },
  });
  return !!channelMember;
}

export function registerChannelHandlers(socket: Socket, userId: string) {
  socket.on("channel:join", async (payload: JoinPayload, callback?: (ok: boolean) => void) => {
    const allowed = await canAccessChannel(userId, payload.workspaceId, payload.channelId);
    if (allowed) {
      socket.join(`channel:${payload.channelId}`);
    }
    callback?.(allowed);
  });

  socket.on("channel:leave", (payload: JoinPayload) => {
    socket.leave(`channel:${payload.channelId}`);
  });
}