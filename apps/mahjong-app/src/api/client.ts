import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getStoredToken } from "../auth/storage";

interface ApiErrorResponse {
  message?: string;
}

function formatHostForUrl(hostname: string) {
  // IPv6 host must be wrapped in brackets when constructing URLs manually.
  return hostname.includes(":") ? `[${hostname}]` : hostname;
}

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:3000";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = formatHostForUrl(window.location.hostname || "127.0.0.1");
  return `${protocol}//${host}:3000`;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || getDefaultApiBaseUrl();

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

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(withDefaultHeaders);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(toErrorMessage(error))),
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);

  if (response.data === null || response.data === undefined) {
    throw new Error("Empty response received from server");
  }

  return response.data;
}
