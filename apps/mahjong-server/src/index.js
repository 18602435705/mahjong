import express from "express";
import cors from "cors";
import compression from "compression";
import { appConfig } from "./config.js";
import { initDatabase, pingDatabase } from "./db.js";
import authRouter from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  compression({
    filter: (req, res) => {
      if (req.path?.endsWith("/events")) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);

app.get("/", (_req, res) => {
  res.send("Hello from mahjong-server");
});

app.get("/health", async (_req, res, next) => {
  try {
    const dbConnected = await pingDatabase();

    res.json({
      status: "ok",
      app: "mahjong-server",
      db: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Not Found",
    path: req.originalUrl,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

async function startServer() {
  await initDatabase();

  app.listen(appConfig.port, () => {
    console.log(`mahjong-server listening on http://localhost:${appConfig.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start mahjong-server", error);
  process.exit(1);
});
