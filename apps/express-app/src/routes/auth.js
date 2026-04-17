import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appConfig } from "../config.js";
import { getDbPool } from "../db.js";

const router = Router();

function isValidUsername(username) {
  return typeof username === "string" && /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6 && password.length <= 72;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
    },
    appConfig.jwtSecret,
    {
      expiresIn: appConfig.jwtExpiresIn,
    },
  );
}

function requireToken(req, res, next) {
  if (!req.token) {
    res.status(401).json({
      status: "error",
      message: "Missing authorization token",
    });
    return;
  }

  try {
    req.auth = jwt.verify(req.token, appConfig.jwtSecret);
    next();
  } catch {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
}

router.post("/register", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!isValidUsername(username)) {
    res.status(400).json({
      status: "error",
      message: "Username must be 3-32 chars, letters/numbers/underscore only",
    });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({
      status: "error",
      message: "Password must be 6-72 chars",
    });
    return;
  }

  const db = getDbPool();
  const [existingUsers] = await db.execute(
    "SELECT id FROM users WHERE username = ? LIMIT 1",
    [username],
  );

  if (existingUsers.length > 0) {
    res.status(409).json({
      status: "error",
      message: "Username already exists",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let insertResult;

  try {
    [insertResult] = await db.execute(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash],
    );
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        status: "error",
        message: "Username already exists",
      });
      return;
    }
    throw error;
  }

  const user = {
    id: insertResult.insertId,
    username,
  };

  res.status(201).json({
    status: "ok",
    message: "Register success",
    user,
    token: signToken(user),
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!isValidUsername(username) || typeof password !== "string") {
    res.status(400).json({
      status: "error",
      message: "Invalid username or password format",
    });
    return;
  }

  const db = getDbPool();
  const [rows] = await db.execute(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username],
  );

  if (rows.length === 0) {
    res.status(401).json({
      status: "error",
      message: "Invalid username or password",
    });
    return;
  }

  const userRow = rows[0];
  const passwordMatched = await bcrypt.compare(password, userRow.password_hash);

  if (!passwordMatched) {
    res.status(401).json({
      status: "error",
      message: "Invalid username or password",
    });
    return;
  }

  const user = {
    id: userRow.id,
    username: userRow.username,
  };

  res.json({
    status: "ok",
    message: "Login success",
    user,
    token: signToken(user),
  });
});

router.get("/me", requireToken, async (req, res) => {
  const userId = Number(req.auth.sub);

  if (!Number.isFinite(userId)) {
    res.status(401).json({
      status: "error",
      message: "Invalid token payload",
    });
    return;
  }

  const db = getDbPool();
  const [rows] = await db.execute(
    "SELECT id, username, created_at AS createdAt FROM users WHERE id = ? LIMIT 1",
    [userId],
  );

  if (rows.length === 0) {
    res.status(404).json({
      status: "error",
      message: "User not found",
    });
    return;
  }

  res.json({
    status: "ok",
    user: rows[0],
  });
});

export default router;
