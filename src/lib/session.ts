import { User } from "@/types";

const SESSION_KEY = "parengge_kita_session_user";

export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSessionUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Set a lightweight cookie for middleware / server compatibility
    document.cookie = `parengge_user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save session user", e);
  }
}

export function clearSessionUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
    document.cookie = `parengge_user_role=; path=/; max-age=0`;
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}
