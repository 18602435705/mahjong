export interface AuthUser {
  id: number;
  username: string;
  createdAt?: string;
}

const TOKEN_STORAGE_KEY = "mahjong_app_token";
const USER_STORAGE_KEY = "mahjong_app_user";

function safeParseUser(rawValue: string | null): AuthUser | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthUser;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.id !== "number" || typeof parsed.username !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token && token.trim() ? token : null;
}

export function getStoredUser(): AuthUser | null {
  return safeParseUser(localStorage.getItem(USER_STORAGE_KEY));
}

export function persistSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
