import { Socket } from "socket.io";
import { prisma } from "../../config/database";
import { emitToWorkspace } from "../emitter";

export async function handlePresenceConnect(socket: Socket, userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });

  for (const { workspaceId } of memberships) {
    socket.join(`workspace:${workspaceId}`);
  }

  await prisma.user.update({ where: { id: userId }, data: { status: "ONLINE" } });

  for (const { workspaceId } of memberships) {
    emitToWorkspace(workspaceId, "presence:update", { userId, status: "ONLINE" });
  }
}

export async function handlePresenceDisconnect(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });

  const lastSeenAt = new Date();
  await prisma.user.update({ where: { id: userId }, data: { status: "OFFLINE", lastSeenAt } });

  for (const { workspaceId } of memberships) {
    emitToWorkspace(workspaceId, "presence:update", { userId, status: "OFFLINE", lastSeenAt });
  }
}