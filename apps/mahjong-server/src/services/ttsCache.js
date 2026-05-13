import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

function safeUnlink(filePath) {
  return fs.unlink(filePath).catch(() => {
    // no-op
  });
}

/**
 * 双层缓存：
 * 1) 进程内 LRU（低延迟）
 * 2) 磁盘缓存（跨请求复用）
 */
export class TtsCache {
  constructor({ cacheDir, cacheMaxItems, cacheTtlMs }) {
    this.cacheDir = cacheDir;
    this.cacheMaxItems = cacheMaxItems;
    this.cacheTtlMs = cacheTtlMs;
    this.memoryCache = new Map();
    this.ensureDirTask = fs.mkdir(cacheDir, { recursive: true });
  }

  getCacheKey(parts) {
    const raw = parts.join("|");
    return crypto.createHash("sha1").update(raw).digest("hex");
  }

  getCachePath(cacheKey) {
    return path.join(this.cacheDir, `${cacheKey}.mp3`);
  }

  isExpired(createdAt) {
    return Date.now() - createdAt > this.cacheTtlMs;
  }

  touchMemory(cacheKey, buffer) {
    this.memoryCache.delete(cacheKey);
    this.memoryCache.set(cacheKey, {
      buffer,
      createdAt: Date.now(),
    });

    while (this.memoryCache.size > this.cacheMaxItems) {
      const oldest = this.memoryCache.keys().next().value;
      if (!oldest) {
        break;
      }
      this.memoryCache.delete(oldest);
    }
  }

  getFromMemory(cacheKey) {
    const hit = this.memoryCache.get(cacheKey);
    if (!hit) {
      return null;
    }

    if (this.isExpired(hit.createdAt)) {
      this.memoryCache.delete(cacheKey);
      return null;
    }

    this.touchMemory(cacheKey, hit.buffer);
    return hit.buffer;
  }

  async get(cacheKey) {
    const memoryHit = this.getFromMemory(cacheKey);
    if (memoryHit) {
      return memoryHit;
    }

    await this.ensureDirTask;
    const cachePath = this.getCachePath(cacheKey);

    let stat;
    try {
      stat = await fs.stat(cachePath);
    } catch {
      return null;
    }

    if (this.isExpired(stat.mtimeMs)) {
      await safeUnlink(cachePath);
      return null;
    }

    try {
      const buffer = await fs.readFile(cachePath);
      this.touchMemory(cacheKey, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  async set(cacheKey, audioBuffer) {
    if (!audioBuffer || audioBuffer.length === 0) {
      return;
    }

    this.touchMemory(cacheKey, audioBuffer);

    await this.ensureDirTask;
    const cachePath = this.getCachePath(cacheKey);
    const tempPath = `${cachePath}.${crypto.randomUUID()}.tmp`;

    try {
      await fs.writeFile(tempPath, audioBuffer);
      await fs.rename(tempPath, cachePath);
    } catch {
      await safeUnlink(tempPath);
    }
  }
}

