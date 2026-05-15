import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearStoredSession, getStoredToken } from "../auth/storage";

interface ApiErrorResponse {
  message?: string;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";

function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    const responseMessage = responseData?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }

    return "Network request failed";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Network request failed";
}

function withDefaultHeaders(config: InternalAxiosRequestConfig) {
  const headers = AxiosHeaders.from(config.headers);
  const token = getStoredToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
}

function handleUnauthorized() {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredSession();

  if (window.location.pathname !== "/auth") {
    window.alert("登录已失效，即将跳转到登录页");
    window.location.replace("/auth");
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(withDefaultHeaders);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const hasToken = Boolean(getStoredToken());
      const hasAuthHeader = AxiosHeaders.from(error.config?.headers).has(
        "Authorization",
      );

      if (hasToken || hasAuthHeader) {
        handleUnauthorized();
      }
    }

    return Promise.reject(new Error(toErrorMessage(error)));
  },
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);

  if (response.data === null || response.data === undefined) {
    throw new Error("Empty response received from server");
  }

  return response.data;
}
