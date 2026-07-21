const KEY = "rapidtalk:pendingInviteToken";

export function setPendingInvite(token: string) {
  localStorage.setItem(KEY, token);
}

export function getPendingInvite(): string | null {
  return localStorage.getItem(KEY);
}

export function clearPendingInvite() {
  localStorage.removeItem(KEY);
}
