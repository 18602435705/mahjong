import crypto from "node:crypto";
import { appConfig } from "../config.js";
import { TtsCache } from "./ttsCache.js";

const DEFAULT_TEXT_LIMIT = 120;
const SESSION_SECRET = appConfig.jwtSecret || "mahjong-tts-session-secret";

// 基于文件系统的缓存，在当前进程内为所有 TTS 请求复用。
const ttsCache = new TtsCache({
  cacheDir: appConfig.tts.cacheDir,
  cacheMaxItems: appConfig.tts.cacheMaxItems,
  cacheTtlMs: appConfig.tts.cacheTtlMs,
});

// 同一 cacheKey 只允许一个上游请求在飞，避免重复合成。
const inflightMap = new Map();

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
}

// 签名前做稳定序列化，避免对象键顺序不同导致签名变化。
function buildSessionSignature(payload) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(stableStringify(payload))
    .digest("hex");
}

function decodeBase64Chunk(value) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  try {
    return Buffer.from(value, "base64");
  } catch {
    return null;
  }
}

// 上游是流式返回，可能一次包含多个 JSON，也可能只有半个 JSON；
// 这里按增量方式切出完整对象，并把未完成尾巴留到下一批数据继续拼接。
function splitJsonObjectsFromBuffer(bufferText) {
  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < bufferText.length; index += 1) {
    const char = bufferText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(bufferText.slice(start, index + 1));
        start = -1;
      }
    }
  }

  if (depth === 0) {
    return {
      objects,
      remainder: "",
    };
  }

  const remainderStart = start >= 0 ? start : bufferText.length;
  return {
    objects,
    remainder: bufferText.slice(remainderStart),
  };
}

function normalizeText(rawText) {
  if (typeof rawText !== "string") {
    return "";
  }

  return rawText.trim().replace(/\s+/g, " ");
}

function ensureTtsConfigured() {
  if (!appConfig.tts.apiKey) {
    throw new Error("VOLC_TTS_API_KEY is not configured");
  }
}

function createUpstreamPayload(text) {
  return {
    user: {
      uid: "mahjong-app",
    },
    req_params: {
      text,
      speaker: appConfig.tts.speaker,
      audio_params: {
        format: appConfig.tts.format,
        sample_rate: appConfig.tts.sampleRate,
      },
    },
  };
}

function createUpstreamHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": appConfig.tts.apiKey,
    "X-Api-Resource-Id": appConfig.tts.resourceId,
  };
}

async function synthesizeToBuffer(text, onAudioChunk) {
  ensureTtsConfigured();
  const requestId = crypto.randomUUID();
  let response;

  try {
    response = await fetch(appConfig.tts.endpoint, {
      method: "POST",
      headers: {
        ...createUpstreamHeaders(),
        "X-Api-Request-Id": requestId,
      },
      body: JSON.stringify(createUpstreamPayload(text)),
    });
  } catch (error) {
    console.error("[TTS] 上游请求失败", {
      endpoint: appConfig.tts.endpoint,
      requestId,
      textLength: text.length,
      errorMessage: error instanceof Error ? error.message : String(error),
      causeMessage:
        error instanceof Error &&
        error.cause &&
        typeof error.cause === "object" &&
        "message" in error.cause
          ? String(error.cause.message)
          : undefined,
    });
    throw new Error("TTS upstream request failed", { cause: error });
  }

  if (!response.ok || !response.body) {
    let rawBody = "";
    try {
      rawBody = await response.text();
    } catch {
      // no-op
    }

    let upstreamReqId = response.headers.get("x-tt-logid") || undefined;
    let upstreamCode;
    let upstreamMessage;

    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody);
        upstreamReqId = parsed?.header?.reqid || parsed?.reqid || upstreamReqId;
        const parsedCode = Number(parsed?.header?.code ?? parsed?.code);
        if (Number.isFinite(parsedCode)) {
          upstreamCode = parsedCode;
        }
        upstreamMessage = parsed?.header?.message || parsed?.message || undefined;
      } catch {
        // no-op
      }
    }

    console.error("[TTS] 上游返回异常", {
      endpoint: appConfig.tts.endpoint,
      requestId,
      status: response.status,
      statusText: response.statusText,
      upstreamReqId,
      upstreamCode,
      upstreamMessage,
      bodyPreview: rawBody ? rawBody.slice(0, 300) : undefined,
    });

    throw new Error(`TTS upstream failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let textBuffer = "";
  const chunks = [];
  let completed = false;
  let totalSize = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    textBuffer += decoder.decode(value, { stream: true });
    const parsed = splitJsonObjectsFromBuffer(textBuffer);
    textBuffer = parsed.remainder;

    for (const rawObjectText of parsed.objects) {
      let envelope;
      try {
        envelope = JSON.parse(rawObjectText);
      } catch {
        // 忽略格式异常的片段，继续读取后续流数据。
        continue;
      }

      const code = Number(envelope?.code);
      // code === 0 表示携带了 base64 编码的音频数据。
      if (code === 0 && envelope?.data) {
        const audioChunk = decodeBase64Chunk(envelope.data);
        if (!audioChunk || audioChunk.length === 0) {
          continue;
        }

        chunks.push(audioChunk);
        totalSize += audioChunk.length;

        if (typeof onAudioChunk === "function") {
          onAudioChunk(audioChunk);
        }
        continue;
      }

      // code === 20000000 表示上游协议中的“合成完成”。
      if (code === 20000000) {
        completed = true;
        break;
      }
    }

    if (completed) {
      break;
    }
  }

  if (!completed || totalSize === 0) {
    throw new Error("TTS returned empty audio");
  }

  return Buffer.concat(chunks, totalSize);
}

function getCacheKey(text) {
  return ttsCache.getCacheKey([
    appConfig.tts.resourceId,
    appConfig.tts.speaker,
    appConfig.tts.format,
    String(appConfig.tts.sampleRate),
    text,
  ]);
}

// 按 cacheKey 做并发去重，并在任务结束后清理 inflight 引用。
function getOrCreateInflight(cacheKey, factory) {
  const existing = inflightMap.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = factory().finally(() => {
    if (inflightMap.get(cacheKey) === promise) {
      inflightMap.delete(cacheKey);
    }
  });

  inflightMap.set(cacheKey, promise);
  return promise;
}

// 生成短时效签名 token，避免直接暴露原始文本参数。
export function createTtsSession(rawText) {
  const text = normalizeText(rawText);
  if (!text || text.length > DEFAULT_TEXT_LIMIT) {
    return null;
  }

  const now = Date.now();
  const sessionPayload = {
    text,
    issuedAt: now,
    expiresAt: now + appConfig.tts.sessionTtlMs,
    nonce: crypto.randomUUID(),
  };

  const signature = buildSessionSignature(sessionPayload);
  return {
    token: Buffer.from(
      JSON.stringify({
        payload: sessionPayload,
        signature,
      }),
      "utf-8",
    ).toString("base64url"),
  };
}

// 解析并校验 token 的完整性与过期时间，通过后才允许发起合成。
export function parseTtsSession(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  const payload = decoded.payload;
  const signature = decoded.signature;
  if (!payload || typeof payload !== "object" || typeof signature !== "string") {
    return null;
  }

  const expectedSignature = buildSessionSignature(payload);
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  const expiresAt = Number(payload.expiresAt);
  const text = normalizeText(payload.text);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt || !text) {
    return null;
  }

  return {
    text,
  };
}

function writeAudioStreamHeaders(res) {
  if (res.headersSent) {
    return;
  }

  const browserCacheMaxAge = Math.max(
    0,
    Math.floor(appConfig.tts.cacheTtlMs / 1000),
  );

  res.status(200);
  res.setHeader("Content-Type", "audio/mpeg");
  // 允许浏览器缓存，避免重复拉取相同音频；使用 private 避免共享代理缓存。
  res.setHeader("Cache-Control", `private, max-age=${browserCacheMaxAge}`);
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export async function streamTtsAudio(text, res) {
  // 快路径：命中磁盘缓存，直接返回音频。
  const cacheKey = getCacheKey(text);
  const cached = await ttsCache.get(cacheKey);
  if (cached) {
    writeAudioStreamHeaders(res);
    res.end(cached);
    return;
  }

  // 如果相同文本正在合成，复用该请求结果，避免重复调用上游。
  const existing = inflightMap.get(cacheKey);
  if (existing) {
    const sharedBuffer = await existing;
    writeAudioStreamHeaders(res);
    res.end(sharedBuffer);
    return;
  }

  let totalSize = 0;
  const chunks = [];
  const synthesisTask = getOrCreateInflight(cacheKey, async () => {
    // 边向当前客户端流式写出，边累计字节用于落缓存。
    const buffer = await synthesizeToBuffer(text, (chunk) => {
      chunks.push(chunk);
      totalSize += chunk.length;

      if (!res.writableEnded && !res.destroyed) {
        writeAudioStreamHeaders(res);
        res.write(chunk);
      }
    });

    // 兜底合并路径：若仅通过 chunk 写出，最终在这里合并后写入缓存。
    if (buffer.length === 0 && totalSize > 0) {
      const merged = Buffer.concat(chunks, totalSize);
      await ttsCache.set(cacheKey, merged);
      return merged;
    }

    await ttsCache.set(cacheKey, buffer);
    return buffer;
  });

  const finalBuffer = await synthesisTask;
  if (!res.writableEnded && !res.destroyed) {
    if (!res.headersSent) {
      writeAudioStreamHeaders(res);
      res.end(finalBuffer);
      return;
    }
    res.end();
  }
}
