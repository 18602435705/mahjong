import { requestJson } from "./client";
import type { AuthUser } from "../auth/storage";

interface AuthSuccessResponse {
  status: "ok";
  message?: string;
  user: AuthUser;
  token: string;
}

interface MeSuccessResponse {
  status: "ok";
  user: AuthUser;
}

export interface AuthPayload {
  username: string;
  password: string;
}

export async function registerByPassword(payload: AuthPayload) {
  return requestJson<AuthSuccessResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginByPassword(payload: AuthPayload) {
  return requestJson<AuthSuccessResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token: string) {
  return requestJson<MeSuccessResponse>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
