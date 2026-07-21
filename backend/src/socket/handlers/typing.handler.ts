import { Socket } from "socket.io";

interface TypingPayload {
  channelId: string;
  name: string;
}

export function registerTypingHandlers(socket: Socket, userId: string) {
  socket.on("typing:start", (payload: TypingPayload) => {
    socket.to(`channel:${payload.channelId}`).emit("typing:update", {
      channelId: payload.channelId,
      userId,
      name: payload.name,
      isTyping: true,
    });
  });

  socket.on("typing:stop", (payload: TypingPayload) => {
    socket.to(`channel:${payload.channelId}`).emit("typing:update", {
      channelId: payload.channelId,
      userId,
      name: payload.name,
      isTyping: false,
    });
  });
}