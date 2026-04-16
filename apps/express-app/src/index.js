import express from "express";
import cors from "cors";
import compression from "compression";

const app = express();
const port = Number(process.env.PORT) || 3000;

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

app.get("/", (_req, res) => {
  res.send("Hello from express-app");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "express-app",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`express-app listening on http://localhost:${port}`);
});
