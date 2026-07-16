import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/store/auth.store";

interface AuthResponse {
  data: { accessToken: string; user: AuthUser };
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>("/auth/login", input);
      return data.data;
    },
    onSuccess: ({ accessToken, user }) => setSession(accessToken, user),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>("/auth/register", input);
      return data.data;
    },
    onSuccess: ({ accessToken, user }) => setSession(accessToken, user),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<{ data: AuthUser }>("/auth/me");
      return data.data;
    },
    enabled,
    retry: false,
  });
}