import { Router } from "express";
import { getAuthUser, requireAuth } from "../middleware/requireAuth.js";
import {
  createRoom,
  getRoomView,
  joinRoom,
  RoomError,
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

router.post("/create", (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const room = createRoom(user, req.body?.presetId);

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

export default router;
