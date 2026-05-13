import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createTtsSession,
  parseTtsSession,
  streamTtsAudio,
} from "../services/ttsService.js";

const router = Router();

router.post("/session", requireAuth, (req, res) => {
  const session = createTtsSession(req.body?.text);
  if (!session) {
    res.status(400).json({
      status: "error",
      message: "Invalid tts text",
    });
    return;
  }

  const streamUrl = `/api/tts/stream/${session.token}`;
  res.json({
    status: "ok",
    streamUrl,
  });
});

router.get("/stream/:token", async (req, res, next) => {
  const parsed = parseTtsSession(req.params.token);
  if (!parsed) {
    res.status(400).json({
      status: "error",
      message: "Invalid or expired tts session",
    });
    return;
  }

  try {
    await streamTtsAudio(parsed.text, res);
  } catch (error) {
    console.error("[TTS] stream failed", {
      path: req.originalUrl,
      errorMessage: error instanceof Error ? error.message : String(error),
      causeMessage:
        error instanceof Error &&
        error.cause &&
        typeof error.cause === "object" &&
        "message" in error.cause
          ? String(error.cause.message)
          : undefined,
    });

    if (!res.headersSent) {
      res.status(502).json({
        status: "error",
        message: "TTS synthesis failed",
      });
      return;
    }

    if (!res.writableEnded) {
      res.end();
    }
    next(error);
  }
});

export default router;
