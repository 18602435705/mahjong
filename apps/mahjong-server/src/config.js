import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const defaultPort = 3000;
const defaultDbPort = 3306;
const defaultTtsCacheDir = "/private/tmp/mahjong-tts-cache";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig = {
  port: toNumber(process.env.PORT, defaultPort),
  jwtSecret: process.env.JWT_SECRET || "replace-with-strong-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    host: process.env.MYSQL_HOST,
    port: toNumber(process.env.MYSQL_PORT, defaultDbPort),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  tts: {
    apiKey: process.env.VOLC_TTS_API_KEY || "",
    endpoint:
      process.env.VOLC_TTS_ENDPOINT ||
      "https://openspeech.bytedance.com/api/v3/tts/unidirectional",
    resourceId: process.env.VOLC_TTS_RESOURCE_ID || "seed-tts-2.0",
    speaker: process.env.VOLC_TTS_SPEAKER || "zh_female_xiaohe_uranus_bigtts",
    format: process.env.VOLC_TTS_FORMAT || "mp3",
    sampleRate: toNumber(process.env.VOLC_TTS_SAMPLE_RATE, 24000),
    sessionTtlMs: toNumber(process.env.TTS_SESSION_TTL_MS, 60000),
    cacheMaxItems: toNumber(process.env.TTS_CACHE_MAX_ITEMS, 500),
    cacheTtlMs: toNumber(process.env.TTS_CACHE_TTL_MS, 24 * 60 * 60 * 1000),
    cacheDir: process.env.TTS_CACHE_DIR || defaultTtsCacheDir,
  },
};
