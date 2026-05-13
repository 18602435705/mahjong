import { getStoredToken } from "./auth/storage";
import { API_BASE_URL } from "./api/client";

const WINDOW_EVENT = {
  POINTER_DOWN: "pointerdown",
  TOUCH_START: "touchstart",
  KEY_DOWN: "keydown",
} as const;

const VOICE_ENABLED_STORAGE_KEY = "mahjong_app_voice_enabled";
const VOICE_SESSION_PATH = "/api/tts/session";
const MAX_TEXT_LENGTH = 120;

let unlockBound = false;
let playbackUnlocked = false;
let playbackQueue: Promise<void> = Promise.resolve();
let activeAudio: HTMLAudioElement | null = null;
let voiceEnabledInitialized = false;
let voiceEnabled = true;

function ensureVoiceEnabledInitialized() {
  if (voiceEnabledInitialized) {
    return;
  }

  voiceEnabledInitialized = true;

  if (typeof window === "undefined") {
    voiceEnabled = true;
    return;
  }

  try {
    const raw = window.localStorage.getItem(VOICE_ENABLED_STORAGE_KEY);
    voiceEnabled = raw === null ? true : raw === "true";
  } catch {
    voiceEnabled = true;
  }
}

function persistVoiceEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(VOICE_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    // no-op
  }
}

function normalizeVoiceText(rawText: string): string {
  return rawText.trim().replace(/\s+/g, " ");
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    activeAudio = audio;
    audio.preload = "auto";
    audio.volume = 0.96;

    const cleanup = () => {
      audio.removeEventListener("ended", handleDone);
      audio.removeEventListener("error", handleDone);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };

    const handleDone = () => {
      cleanup();
      resolve();
    };

    audio.addEventListener("ended", handleDone);
    audio.addEventListener("error", handleDone);

    void audio.play().catch(() => {
      cleanup();
      resolve();
    });
  });
}

function toAbsoluteStreamUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const base = API_BASE_URL || window.location.origin;
  return new URL(pathOrUrl, base).toString();
}

async function requestTtsStreamUrl(text: string): Promise<string | null> {
  try {
    const token = getStoredToken();
    if (!token) {
      return null;
    }

    const response = await fetch(
      new URL(VOICE_SESSION_PATH, API_BASE_URL || window.location.origin).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      status?: string;
      streamUrl?: string;
    };
    const streamUrl = body.streamUrl;
    if (typeof streamUrl !== "string" || !streamUrl.trim()) {
      return null;
    }

    return toAbsoluteStreamUrl(streamUrl);
  } catch {
    return null;
  }
}

function canPlayNow() {
  return typeof window !== "undefined" && playbackUnlocked && voiceEnabled;
}

function stopActiveAudio() {
  if (!activeAudio) {
    return;
  }

  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

function clearPlaybackQueue() {
  playbackQueue = Promise.resolve();
}

function disableVoicePlayback() {
  clearPlaybackQueue();
  stopActiveAudio();
}

export function isVoiceEnabled() {
  ensureVoiceEnabledInitialized();
  return voiceEnabled;
}

export function setVoiceEnabled(enabled: boolean) {
  ensureVoiceEnabledInitialized();
  voiceEnabled = enabled;
  persistVoiceEnabled(enabled);

  if (!enabled) {
    disableVoicePlayback();
  }
}

/**
 * 在用户手势中主动解锁音频播放能力。
 */
export function activateVoicePlayback() {
  ensureVoiceEnabledInitialized();
  playbackUnlocked = true;
}

/**
 * 注册全局手势监听：首次交互时解锁音频播放。
 */
export function installAudioUnlock() {
  if (typeof window === "undefined" || unlockBound) {
    return;
  }

  unlockBound = true;

  const unlock = () => {
    activateVoicePlayback();

    window.removeEventListener(WINDOW_EVENT.POINTER_DOWN, unlock);
    window.removeEventListener(WINDOW_EVENT.TOUCH_START, unlock);
    window.removeEventListener(WINDOW_EVENT.KEY_DOWN, unlock);
    unlockBound = false;
  };

  window.addEventListener(WINDOW_EVENT.POINTER_DOWN, unlock, { passive: true });
  window.addEventListener(WINDOW_EVENT.TOUCH_START, unlock, { passive: true });
  window.addEventListener(WINDOW_EVENT.KEY_DOWN, unlock);
}

/**
 * 使用服务端 TTS 流式地址播放动作文案，失败时静默跳过。
 */
export function playActionVoice(voice: string) {
  ensureVoiceEnabledInitialized();

  if (!canPlayNow()) {
    return;
  }

  const text = normalizeVoiceText(voice);
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return;
  }

  playbackQueue = playbackQueue
    .then(async () => {
      if (!voiceEnabled) {
        return;
      }

      const streamUrl = await requestTtsStreamUrl(text);
      if (!streamUrl || !voiceEnabled) {
        return;
      }

      await playUrl(streamUrl);
    })
    .catch(() => {
      // no-op
    });
}
