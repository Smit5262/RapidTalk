import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { connectSocket, disconnectSocket } from "@/services/socket";

export function useSocketConnection() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    return () => {
      socket.disconnect();
      disconnectSocket();
    };
  }, [accessToken]);
}