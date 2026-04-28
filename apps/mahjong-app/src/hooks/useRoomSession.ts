import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/client";
import { GAME_ACTION, type GameAction } from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";
import { useAuth } from "../auth/useAuth";
import type { RoomSnapshot } from "../types/room";
import type { MatchResultSnapshot } from "../types/result";

interface SocketErrorResponse {
  status: "error";
  code?: number;
  message: string;
}

type SocketAckResponse<T extends object = Record<string, never>> =
  | ({ status: "ok" } & T)
  | SocketErrorResponse;

/**
 * 判断任意值是否满足房间快照的最小结构要求。
 */
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

/**
 * 从服务端推送包中提取房间快照；结构不合法时返回 null。
 */
function parseRoomUpdate(payload: unknown): RoomSnapshot | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const envelope = payload as {
    room?: unknown;
  };

  return isRoomSnapshot(envelope.room) ? envelope.room : null;
}

/**
 * 判断任意值是否满足对局结算快照的最小结构要求。
 */
function isMatchResultSnapshot(value: unknown): value is MatchResultSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MatchResultSnapshot>;
  if (typeof candidate.roomCode !== "string" || typeof candidate.endedAt !== "string") {
    return false;
  }

  if (!Array.isArray(candidate.players)) {
    return false;
  }

  return candidate.players.every((row) => {
    if (!row || typeof row !== "object") {
      return false;
    }

    const player = row as {
      seatIndex?: unknown;
      userId?: unknown;
      username?: unknown;
      score?: unknown;
      rank?: unknown;
    };

    return (
      typeof player.seatIndex === "number" &&
      typeof player.userId === "number" &&
      typeof player.username === "string" &&
      typeof player.score === "number" &&
      typeof player.rank === "number"
    );
  });
}

/**
 * 从服务端结束事件中提取结算快照；结构不合法时返回 null。
 */
function parseRoomEnded(payload: unknown): MatchResultSnapshot | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const envelope = payload as {
    result?: unknown;
  };

  return isMatchResultSnapshot(envelope.result) ? envelope.result : null;
}

/**
 * 归一化 Ack 错误文案，优先使用服务端返回的 message。
 */
function normalizeAckError(response: SocketErrorResponse | null, fallback: string) {
  if (!response?.message) {
    return fallback;
  }

  return response.message;
}

/**
 * 发送 Socket 事件并等待 Ack，内置超时保护。
 */
function emitWithAck<TPayload extends object, TResult extends object>(
  socket: Socket,
  event: string,
  payload: TPayload,
): Promise<SocketAckResponse<TResult>> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Socket request timeout"));
    }, 10000);

    socket.emit(event, payload, (response: unknown) => {
      window.clearTimeout(timer);

      if (!response || typeof response !== "object") {
        resolve({
          status: "error",
          message: "Unexpected socket response",
        });
        return;
      }

      resolve(response as SocketAckResponse<TResult>);
    });
  });
}

/**
 * 在房间模式下同步服务端状态，并将本地动作通过 Socket.IO 转发给服务端。
 */
export function useRoomSession(roomCode: string | null) {
  const { token } = useAuth();
  const clearRoomSession = useGameStore((store) => store.clearRoomSession);
  const setRoomSnapshot = useGameStore((store) => store.setRoomSnapshot);
  const setRemoteDispatch = useGameStore((store) => store.setRemoteDispatch);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [matchResult, setMatchResult] = useState<MatchResultSnapshot | null>(null);
  const inFlightRef = useRef(false);
  const queuedActionRef = useRef<GameAction | null>(null);
  const activeRoomCodeRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  /**
   * 统一封装房间级请求：自动注入 roomCode、处理错误并同步快照。
   */
  const emitRoomRequest = useCallback(
    async <TResult extends object>(
      event: string,
      payload: Record<string, unknown>,
      fallbackError: string,
    ) => {
      if (!roomCode) {
        throw new Error("房间不存在");
      }

      const socket = socketRef.current;
      if (!socket) {
        throw new Error("连接尚未建立");
      }

      const response = await emitWithAck<
        { roomCode: string } & Record<string, unknown>,
        TResult
      >(socket, event, {
        roomCode,
        ...payload,
      });

      if (response.status === "error") {
        throw new Error(normalizeAckError(response, fallbackError));
      }

      const maybeRoom = (response as { room?: unknown }).room;
      if (isRoomSnapshot(maybeRoom)) {
        setRoomSnapshot(maybeRoom);
      }

      setConnectionError("");
      return response;
    },
    [roomCode, setRoomSnapshot],
  );

  /**
   * 按顺序发送对局动作，避免并发提交导致状态错乱。
   */
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

      const socket = socketRef.current;
      if (!socket) {
        queuedActionRef.current = action;
        setConnectionError("连接尚未建立，动作已排队");
        return;
      }

      inFlightRef.current = true;
      try {
        await emitRoomRequest<{ room: RoomSnapshot }>("room.action", {
          action,
        }, "Action request failed");
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
    [roomCode, emitRoomRequest],
  );

  /**
   * 发送“准备/取消准备”请求。
   */
  const sendReady = useCallback(
    async (ready: boolean) => {
      await emitRoomRequest<{ room: RoomSnapshot }>(
        "room.ready",
        { ready },
        "设置准备状态失败",
      );
    },
    [emitRoomRequest],
  );

  /**
   * 发送“开始对局”请求。
   */
  const sendStart = useCallback(async () => {
    await emitRoomRequest<{ room: RoomSnapshot }>("room.start", {}, "开局失败");
  }, [emitRoomRequest]);

  /**
   * 发送“离开房间”请求。
   */
  const sendLeave = useCallback(async () => {
    await emitRoomRequest<Record<string, never>>("room.leave", {}, "离开房间失败");
  }, [emitRoomRequest]);

  /**
   * 发送“再来一局”确认请求，确认后不可撤回。
   */
  const sendRematchReady = useCallback(async () => {
    await emitRoomRequest<{ room: RoomSnapshot }>(
      "room.rematch.ready",
      {},
      "确认再来一局失败",
    );
  }, [emitRoomRequest]);

  /**
   * 房主结束整场对局并触发结算广播。
   */
  const sendEndMatch = useCallback(async () => {
    const response = await emitRoomRequest<{ result?: MatchResultSnapshot }>(
      "room.match.end",
      {},
      "结束对局失败",
    );

    if (isMatchResultSnapshot(response.result)) {
      setMatchResult(response.result);
    }
  }, [emitRoomRequest]);

  useEffect(() => {
    if (!roomCode || !token) {
      setRemoteDispatch(null);
      setMatchResult(null);
      socketRef.current?.disconnect();
      socketRef.current = null;
      inFlightRef.current = false;
      queuedActionRef.current = null;

      if (activeRoomCodeRef.current && !roomCode) {
        clearRoomSession();
      }
      activeRoomCodeRef.current = roomCode;
      return;
    }

    activeRoomCodeRef.current = roomCode;
    let disposed = false;
    inFlightRef.current = false;
    queuedActionRef.current = null;
    setIsConnecting(true);
    setConnectionError("");
    setMatchResult(null);

    setRemoteDispatch((action) => {
      void flushAction(action);
    });

    const socket = io(API_BASE_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    /**
     * 尝试发送排队中的最后一个动作。
     */
    const flushQueued = () => {
      const queued = queuedActionRef.current;
      if (!queued) {
        return;
      }

      queuedActionRef.current = null;
      void flushAction(queued);
    };

    /**
     * 处理房间快照推送并刷新本地状态。
     */
    const handleRoomUpdate = (payload: unknown) => {
      if (disposed) {
        return;
      }

      const room = parseRoomUpdate(payload);
      if (room) {
        setRoomSnapshot(room);
        setIsConnecting(false);
        setConnectionError("");
        flushQueued();
      }
    };

    /**
     * Socket 连接成功后执行房间订阅。
     */
    const handleSocketConnect = () => {
      if (disposed) {
        return;
      }

      setConnectionError("");
      void emitWithAck<{ roomCode: string }, Record<string, never>>(
        socket,
        "room.subscribe",
        {
          roomCode,
        },
      )
        .then((response) => {
          if (disposed) {
            return;
          }

          if (response.status === "error") {
            setIsConnecting(false);
            setConnectionError(normalizeAckError(response, "订阅房间失败"));
            return;
          }

          flushQueued();
        })
        .catch((error) => {
          if (disposed) {
            return;
          }

          const message = error instanceof Error ? error.message : "订阅房间失败";
          setIsConnecting(false);
          setConnectionError(message);
        });
    };

    /**
     * 处理连接建立失败错误。
     */
    const handleConnectError = (error: Error) => {
      if (disposed) {
        return;
      }

      setIsConnecting(false);
      setConnectionError(error.message || "连接失败，请重试");
    };

    /**
     * 处理连接断开提示，等待自动重连。
     */
    const handleDisconnect = () => {
      if (disposed) {
        return;
      }

      setConnectionError("连接中断，正在自动重连...");
    };

    /**
     * 处理服务端房间连接确认事件。
     */
    const handleRoomConnected = () => {
      if (disposed) {
        return;
      }

      setConnectionError("");
    };

    /**
     * 处理房主结束对局广播，记录结算数据供页面跳转。
     */
    const handleRoomEnded = (payload: unknown) => {
      if (disposed) {
        return;
      }

      const result = parseRoomEnded(payload);
      if (result) {
        setConnectionError("");
        setMatchResult(result);
      }
    };

    socket.on("connect", handleSocketConnect);
    socket.on("room.update", handleRoomUpdate);
    socket.on("room.connected", handleRoomConnected);
    socket.on("room.ended", handleRoomEnded);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      disposed = true;
      setRemoteDispatch(null);
      inFlightRef.current = false;
      queuedActionRef.current = null;

      socket.off("connect", handleSocketConnect);
      socket.off("room.update", handleRoomUpdate);
      socket.off("room.connected", handleRoomConnected);
      socket.off("room.ended", handleRoomEnded);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);

      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [roomCode, token, clearRoomSession, setRemoteDispatch, setRoomSnapshot, flushAction]);

  return {
    isConnecting,
    connectionError,
    sendReady,
    sendStart,
    sendLeave,
    sendRematchReady,
    sendEndMatch,
    matchResult,
  };
}
