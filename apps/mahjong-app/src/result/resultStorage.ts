import type { MatchResultSnapshot } from "../types/result";

const RESULT_STORAGE_KEY = "mahjong_last_match_result";

function isMatchResultSnapshot(value: unknown): value is MatchResultSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MatchResultSnapshot>;
  if (typeof candidate.roomCode !== "string") {
    return false;
  }

  if (typeof candidate.endedAt !== "string") {
    return false;
  }

  if (!Array.isArray(candidate.players)) {
    return false;
  }

  return candidate.players.every((player) => {
    if (!player || typeof player !== "object") {
      return false;
    }

    const row = player as {
      seatIndex?: unknown;
      userId?: unknown;
      username?: unknown;
      score?: unknown;
      rank?: unknown;
    };

    return (
      typeof row.seatIndex === "number" &&
      typeof row.userId === "number" &&
      typeof row.username === "string" &&
      typeof row.score === "number" &&
      typeof row.rank === "number"
    );
  });
}

export function persistMatchResult(result: MatchResultSnapshot): void {
  sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function readStoredMatchResult(): MatchResultSnapshot | null {
  const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isMatchResultSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoredMatchResult(): void {
  sessionStorage.removeItem(RESULT_STORAGE_KEY);
}

export function isValidMatchResult(value: unknown): value is MatchResultSnapshot {
  return isMatchResultSnapshot(value);
}
