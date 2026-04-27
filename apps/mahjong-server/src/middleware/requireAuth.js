import jwt from "jsonwebtoken";
import { appConfig } from "../config.js";

export function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.trim()) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : authHeader;
  }

  if (typeof req.query?.token === "string" && req.query.token.trim()) {
    return req.query.token;
  }

  return null;
}

export function verifyAuthToken(token) {
  const payload = jwt.verify(token, appConfig.jwtSecret);
  const userId = Number(payload?.sub);
  const username = typeof payload?.username === "string" ? payload.username : "";

  if (!Number.isFinite(userId) || !username) {
    throw new Error("Invalid token payload");
  }

  return {
    payload,
    user: {
      id: userId,
      username,
    },
  };
}

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      status: "error",
      message: "Missing authorization token",
    });
    return;
  }

  try {
    const { payload, user } = verifyAuthToken(token);

    req.auth = {
      ...payload,
      sub: String(user.id),
      username: user.username,
    };

    next();
  } catch {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
}

export function getAuthUser(req) {
  return {
    id: Number(req.auth.sub),
    username: req.auth.username,
  };
}
