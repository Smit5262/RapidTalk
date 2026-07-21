import { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setIO(io: Server) {
  ioInstance = io;
}

export function emitToChannel(channelId: string, event: string, payload: unknown) {
  ioInstance?.to(`channel:${channelId}`).emit(event, payload);
}

export function emitToWorkspace(workspaceId: string, event: string, payload: unknown) {
  ioInstance?.to(`workspace:${workspaceId}`).emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
}