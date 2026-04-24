import { Router } from "express";
import { getAuthUser, requireAuth } from "../middleware/requireAuth.js";
import {
  applyGameAction,
  createRoom,
  getRoomView,
  joinRoom,
  leaveRoom,
  RoomError,
  setReadyState,
  startGame,
  subscribeRoom,
} from "../services/roomService.js";

const router = Router();
router.use(requireAuth);

function handleRouteError(error, res) {
  if (error instanceof RoomError) {
    res.status(error.status).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  throw error;
}

router.post("/", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = createRoom(user);

    res.status(201).json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.post("/join", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = joinRoom(user, req.body?.roomCode);

    res.json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.get("/:roomCode", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = getRoomView(user.id, req.params.roomCode);

    res.json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.post("/:roomCode/leave", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    leaveRoom(user.id, req.params.roomCode);

    res.json({
      status: "ok",
      message: "Left room",
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.post("/:roomCode/ready", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = setReadyState(user.id, req.params.roomCode, req.body?.ready);

    res.json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.post("/:roomCode/start", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = startGame(user.id, req.params.roomCode);

    res.json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.post("/:roomCode/actions", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = applyGameAction(user.id, req.params.roomCode, req.body?.action);

    res.json({
      status: "ok",
      room,
    });
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

router.get("/:roomCode/events", (req, res, next) => {
  try {
    const user = getAuthUser(req);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    const cleanup = subscribeRoom(user.id, req.params.roomCode, res);
    const heartbeatTimer = setInterval(() => {
      res.write(": heartbeat\\n\\n");
    }, 15000);

    const teardown = () => {
      clearInterval(heartbeatTimer);
      cleanup();
    };

    res.on("close", teardown);
    res.on("error", teardown);
  } catch (error) {
    try {
      handleRouteError(error, res);
    } catch (unknownError) {
      next(unknownError);
    }
  }
});

export default router;
