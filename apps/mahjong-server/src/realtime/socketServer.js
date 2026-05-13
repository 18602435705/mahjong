import { Server } from "socket.io";
import { verifyAuthToken } from "../middleware/requireAuth.js";
import {
  applyGameAction,
  confirmRematch,
  endMatch,
  getRoomView,
  leaveRoom,
  RoomError,
  setReadyState,
  startGame,
  subscribeRoom,
} from "../services/roomService.js";

const AUTH_MISSING_MESSAGE = "Missing authorization token";
const AUTH_INVALID_MESSAGE = "Invalid or expired token";

function toErrorResponse(error) {
  if (error instanceof RoomError) {
    return {
      status: "error",
      code: error.status,
      message: error.message,
    };
  }

  return {
    status: "error",
    code: 500,
    message: "Internal Server Error",
  };
}

function getHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken;
  }

  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken;
  }

  return null;
}

function getRoomCode(payload) {
  if (typeof payload?.roomCode !== "string") {
    throw new RoomError(400, "Room code is required");
  }

  const roomCode = payload.roomCode.trim().toUpperCase();
  if (!roomCode) {
    throw new RoomError(400, "Room code is required");
  }

  return roomCode;
}

function registerRoomHandlers(socket) {
  const user = socket.data.user;
  const subscriptions = new Map();

  const bindSubscription = (roomCode) => {
    const existingCleanup = subscriptions.get(roomCode);
    if (existingCleanup) {
      existingCleanup();
      subscriptions.delete(roomCode);
    }

    const cleanup = subscribeRoom(user.id, roomCode, {
      connectionId: socket.id,
      send: (event, payload) => {
        socket.emit(event, payload);
      },
      close: () => {
        subscriptions.delete(roomCode);
      },
    });

    subscriptions.set(roomCode, cleanup);
  };

  const clearSubscriptions = () => {
    for (const cleanup of subscriptions.values()) {
      cleanup();
    }
    subscriptions.clear();
  };

  socket.on("room.subscribe", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      bindSubscription(roomCode);
      ack?.({ status: "ok" });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.unsubscribe", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const cleanup = subscriptions.get(roomCode);
      if (cleanup) {
        cleanup();
        subscriptions.delete(roomCode);
      }
      ack?.({ status: "ok" });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.get", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const room = getRoomView(user.id, roomCode);
      ack?.({ status: "ok", room });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.action", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const room = applyGameAction(user.id, roomCode, payload.action);
      ack?.({ status: "ok", room });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.rematch.ready", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const room = confirmRematch(user.id, roomCode);
      ack?.({ status: "ok", room });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.ready", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const room = setReadyState(user.id, roomCode, payload.ready);
      ack?.({ status: "ok", room });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.start", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const room = startGame(user.id, roomCode);
      ack?.({ status: "ok", room });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.leave", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      leaveRoom(user.id, roomCode);

      const cleanup = subscriptions.get(roomCode);
      if (cleanup) {
        cleanup();
        subscriptions.delete(roomCode);
      }

      ack?.({ status: "ok", message: "Left room" });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("room.match.end", (payload = {}, ack) => {
    try {
      const roomCode = getRoomCode(payload);
      const result = endMatch(user.id, roomCode);

      const cleanup = subscriptions.get(roomCode);
      if (cleanup) {
        cleanup();
        subscriptions.delete(roomCode);
      }

      ack?.({ status: "ok", result });
    } catch (error) {
      ack?.(toErrorResponse(error));
    }
  });

  socket.on("disconnect", () => {
    clearSubscriptions();
  });
}

export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = getHandshakeToken(socket);
    if (!token) {
      next(new Error(AUTH_MISSING_MESSAGE));
      return;
    }

    try {
      const { user } = verifyAuthToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error(AUTH_INVALID_MESSAGE));
    }
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(socket);
  });

  return io;
}
