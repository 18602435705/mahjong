const DEFAULT_API_BASE_URL = "http://127.0.0.1:3000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

interface ApiErrorResponse {
  message?: string;
}

async function readJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const errorResponse = payload as ApiErrorResponse | null;
    const message =
      errorResponse?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (payload === null) {
    throw new Error("Empty response received from server");
  }

  return payload as T;
}
