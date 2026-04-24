import { useCallback, useEffect, useRef, useState } from "react";
import { getRoomApi, getRoomEventsUrl, postRoomActionApi } from "../api/rooms";
import { GAME_ACTION, type GameAction } from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";
import { useAuth } from "../auth/useAuth";
import type { RoomSnapshot } from "../types/room";

function isRoomSnapshot(value: unknown): value is RoomSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RoomSnapshot>;
  return (
    typeof candidate.code === "string" &&
    (candidate.status === "lobby" || candidate.status === "playing") &&
    typeof candidate.version === "number" &&
    Array.isArray(candidate.seats)
  );
}

function parseRoomUpdate(rawData: string): RoomSnapshot | null {
  const payload = JSON.parse(rawData) as {
    status?: string;
    room?: unknown;
  };

  return isRoomSnapshot(payload.room) ? payload.room : null;
}

/**
 * 在房间模式下同步服务端状态，并将本地动作转发给服务端。
 */
export function useRoomSession(roomCode: string | null) {
  const { token } = useAuth();
  const clearRoomSession = useGameStore((store) => store.clearRoomSession);
  const setRoomSnapshot = useGameStore((store) => store.setRoomSnapshot);
  const setRemoteDispatch = useGameStore((store) => store.setRemoteDispatch);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const inFlightRef = useRef(false);
  const queuedActionRef = useRef<GameAction | null>(null);
  const activeRoomCodeRef = useRef<string | null>(null);

  const flushAction = useCallback(
    async (action: GameAction) => {
      if (!roomCode) {
        return;
      }

      if (action.type === GAME_ACTION.AI_STEP) {
        return;
      }

      if (inFlightRef.current) {
        queuedActionRef.current = action;
        return;
      }

      inFlightRef.current = true;
      try {
        const response = await postRoomActionApi(roomCode, action);
        setRoomSnapshot(response.room);
        setConnectionError("");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Action request failed";
        setConnectionError(message);
      } finally {
        inFlightRef.current = false;
        const queued = queuedActionRef.current;
        queuedActionRef.current = null;
        if (queued) {
          void flushAction(queued);
        }
      }
    },
    [roomCode, setRoomSnapshot],
  );

  useEffect(() => {
    if (!roomCode || !token) {
      setRemoteDispatch(null);
      if (activeRoomCodeRef.current && !roomCode) {
        clearRoomSession();
      }
      activeRoomCodeRef.current = roomCode;
      return;
    }

    activeRoomCodeRef.current = roomCode;
    let disposed = false;
    setIsConnecting(true);
    setConnectionError("");

    setRemoteDispatch((action) => {
      void flushAction(action);
    });

    getRoomApi(roomCode)
      .then((response) => {
        if (disposed) {
          return;
        }
        setRoomSnapshot(response.room);
        setConnectionError("");
      })
      .catch((error) => {
        if (disposed) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load room";
        setConnectionError(message);
      })
      .finally(() => {
        if (!disposed) {
          setIsConnecting(false);
        }
      });

    const eventSource = new EventSource(getRoomEventsUrl(roomCode, token));

    const handleRoomUpdate = (event: MessageEvent<string>) => {
      if (disposed) {
        return;
      }

      try {
        const room = parseRoomUpdate(event.data);
        if (room) {
          setRoomSnapshot(room);
        }
      } catch {
        // ignore malformed message
      }
    };

    const handleSourceError = () => {
      if (disposed) {
        return;
      }

      setConnectionError("连接中断，正在自动重连...");
    };

    const handleConnected = () => {
      if (disposed) {
        return;
      }

      setConnectionError("");
    };

    eventSource.onopen = handleConnected;
    eventSource.addEventListener("room.update", handleRoomUpdate as EventListener);
    eventSource.addEventListener("room.connected", handleConnected as EventListener);
    eventSource.addEventListener("error", handleSourceError as EventListener);

    return () => {
      disposed = true;
      setRemoteDispatch(null);
      eventSource.removeEventListener(
        "room.update",
        handleRoomUpdate as EventListener,
      );
      eventSource.removeEventListener(
        "room.connected",
        handleConnected as EventListener,
      );
      eventSource.removeEventListener("error", handleSourceError as EventListener);
      eventSource.onopen = null;
      eventSource.close();
    };
  }, [
    roomCode,
    token,
    clearRoomSession,
    setRemoteDispatch,
    setRoomSnapshot,
    flushAction,
  ]);

  return {
    isConnecting,
    connectionError,
  };
}
