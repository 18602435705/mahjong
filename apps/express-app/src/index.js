import express from "express";
import cors from "cors";
import compression from "compression";
import { appConfig } from "./config.js";
import { initDatabase, pingDatabase } from "./db.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(compression());
app.use((req, _res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && typeof authHeader === "string") {
    // Support either `Bearer <token>` or raw token.
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    token = match ? match[1] : authHeader;
  }

  req.token = token;
  next();
});

app.use("/api/auth", authRouter);

app.get("/", (_req, res) => {
  res.send("Hello from express-app");
});

app.get("/health", async (_req, res, next) => {
  try {
    const dbConnected = await pingDatabase();

    res.json({
      status: "ok",
      app: "express-app",
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
    console.log(`express-app listening on http://localhost:${appConfig.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start express-app", error);
  process.exit(1);
});
