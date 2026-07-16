import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000", {
    auth: { token: accessToken },
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}