const WINDOW_EVENT = {
  POINTER_DOWN: "pointerdown",
  TOUCH_START: "touchstart",
  KEY_DOWN: "keydown",
} as const;

const LANGUAGE = {
  CHINESE_PREFIX: "zh",
  CHINESE_MAINLAND: "zh-CN",
} as const;

let unlockBound = false;
let speechPrimed = false;
let voicesListenerBound = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

function getSpeechSynthesisSafe() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function refreshVoices() {
  const synthesis = getSpeechSynthesisSafe();
  if (!synthesis) {
    return;
  }
  cachedVoices = synthesis.getVoices();
}

function ensureVoicesReady() {
  const synthesis = getSpeechSynthesisSafe();
  if (!synthesis) {
    return;
  }

  if (!voicesListenerBound) {
    voicesListenerBound = true;
    synthesis.addEventListener("voiceschanged", refreshVoices);
  }

  if (cachedVoices.length === 0) {
    refreshVoices();
  }
}

function pickChineseVoice() {
  if (cachedVoices.length === 0) {
    return null;
  }

  const mainlandVoice = cachedVoices.find(
    (voice) =>
      voice.lang.toLowerCase() === LANGUAGE.CHINESE_MAINLAND.toLowerCase(),
  );
  if (mainlandVoice) {
    return mainlandVoice;
  }

  return (
    cachedVoices.find((voice) =>
      voice.lang.toLowerCase().startsWith(LANGUAGE.CHINESE_PREFIX),
    ) ?? null
  );
}

function primeSpeechSynthesis() {
  if (speechPrimed) {
    return;
  }

  const synthesis = getSpeechSynthesisSafe();
  if (!synthesis) {
    return;
  }

  try {
    // On some mobile browsers, speaking once inside a user gesture helps unlock TTS.
    const probe = new SpeechSynthesisUtterance(" ");
    probe.lang = LANGUAGE.CHINESE_MAINLAND;
    probe.volume = 0;
    probe.rate = 1;
    probe.pitch = 1;

    synthesis.cancel();
    synthesis.resume();
    synthesis.speak(probe);
    speechPrimed = true;
  } catch {
    // no-op
  }
}

/**
 * 在用户手势中主动触发一次 TTS 初始化，提升移动端语音播报成功率。
 */
export function activateVoicePlayback() {
  ensureVoicesReady();
  primeSpeechSynthesis();
}

/**
 * 注册全局手势监听：首次触发时尝试解锁语音播报能力并预加载 voice 列表。
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
 * 调用浏览器语音合成朗读动作文案，优先选择中文语音。
 */
export function playActionVoice(voice: string) {
  const synthesis = getSpeechSynthesisSafe();
  if (!synthesis) {
    return;
  }

  ensureVoicesReady();

  const utterance = new SpeechSynthesisUtterance(voice);
  const chineseVoice = pickChineseVoice();

  utterance.lang = LANGUAGE.CHINESE_MAINLAND;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 0.96;

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  try {
    synthesis.cancel();
    synthesis.resume();
    synthesis.speak(utterance);
  } catch {
    // no-op
  }
}
