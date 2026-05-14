import { request } from "./client";
import type { MatchHistoryItem } from "../types/history";

interface MatchHistoryResponse {
  status: "ok";
  items: MatchHistoryItem[];
  nextCursor: number | null;
}

type GetMatchHistoryParams = {
  cursor?: number | null;
  limit?: number;
};

export function getMatchHistoryApi(params: GetMatchHistoryParams = {}) {
  const query: Record<string, string | number> = {};
  if (typeof params.cursor === "number" && Number.isFinite(params.cursor)) {
    query.cursor = params.cursor;
  }
  if (typeof params.limit === "number" && Number.isFinite(params.limit)) {
    query.limit = params.limit;
  }

  return request<MatchHistoryResponse>({
    url: "/api/rooms/history/list",
    method: "GET",
    params: query,
  });
}
