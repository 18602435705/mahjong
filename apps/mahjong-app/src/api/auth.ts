import { request } from "./client";
import type { AuthUser } from "../auth/storage";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthSuccessResponse {
  status: "ok";
  message?: string;
  user: AuthUser;
  token: string;
}

export interface AuthMeResponse {
  status: "ok";
  user: AuthUser;
}

export function registerByPassword(payload: AuthCredentials) {
  return request<AuthSuccessResponse>({
    url: "/api/auth/register",
    method: "POST",
    data: payload,
  });
}

export function loginByPassword(payload: AuthCredentials) {
  return request<AuthSuccessResponse>({
    url: "/api/auth/login",
    method: "POST",
    data: payload,
  });
}

export function getCurrentUser() {
  return request<AuthMeResponse>({
    url: "/api/auth/me",
    method: "GET",
  });
}
