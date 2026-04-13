export const ACTION_SOUND = {
  DRAW: "draw",
  DISCARD: "discard",
  PENG: "peng",
  GANG: "gang",
  HU: "hu",
} as const;
export type ActionSound = (typeof ACTION_SOUND)[keyof typeof ACTION_SOUND];

const WINDOW_EVENT = {
  POINTER_DOWN: "pointerdown",
  KEY_DOWN: "keydown",
} as const;
const LANGUAGE = {
  CHINESE_PREFIX: "zh",
  CHINESE_MAINLAND: "zh-CN",
} as const;

type ToneOptions = {
  frequency: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  detune?: number;
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let unlockBound = false;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  const Ctx =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Ctx) {
    return null;
  }

  audioContext = new Ctx();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.2;
  masterGain.connect(audioContext.destination);
  return audioContext;
}

function scheduleTone(
  context: AudioContext,
  gainNode: GainNode,
  options: ToneOptions,
) {
  const {
    frequency,
    start,
    duration,
    type = "triangle",
    volume = 0.15,
    detune = 0,
  } = options;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  osc.detune.setValueAtTime(detune, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.007);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(gainNode);

  osc.start(start);
  osc.stop(start + duration + 0.025);
}

export function playActionSound(action: ActionSound) {
  const context = getAudioContext();
  if (!context || !masterGain) {
    return;
  }
  const gainNode = masterGain;

  if (context.state === "suspended") {
    void context.resume().catch(() => {});
  }

  const start = context.currentTime + 0.01;

  if (action === ACTION_SOUND.DRAW) {
    scheduleTone(context, gainNode, {
      frequency: 508,
      start,
      duration: 0.06,
      type: "sine",
      volume: 0.095,
    });
    return;
  }

  if (action === ACTION_SOUND.DISCARD) {
    scheduleTone(context, gainNode, {
      frequency: 410,
      start,
      duration: 0.032,
      type: "square",
      volume: 0.145,
    });
    scheduleTone(context, gainNode, {
      frequency: 286,
      start: start + 0.02,
      duration: 0.05,
      type: "triangle",
      volume: 0.12,
    });
    return;
  }

  if (action === ACTION_SOUND.PENG) {
    [0, 0.06, 0.12].forEach((offset) => {
      scheduleTone(context, gainNode, {
        frequency: 362,
        start: start + offset,
        duration: 0.042,
        type: "triangle",
        volume: 0.122,
      });
    });
    return;
  }

  if (action === ACTION_SOUND.GANG) {
    scheduleTone(context, gainNode, {
      frequency: 225,
      start,
      duration: 0.09,
      type: "square",
      volume: 0.16,
    });
    scheduleTone(context, gainNode, {
      frequency: 332,
      start: start + 0.1,
      duration: 0.055,
      type: "triangle",
      volume: 0.12,
    });
    scheduleTone(context, gainNode, {
      frequency: 262,
      start: start + 0.16,
      duration: 0.06,
      type: "triangle",
      volume: 0.11,
    });
    return;
  }

  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    scheduleTone(context, gainNode, {
      frequency,
      start: start + index * 0.07,
      duration: 0.11,
      type: "sine",
      volume: 0.11,
    });
  });
}

export function installAudioUnlock() {
  if (typeof window === "undefined" || unlockBound) {
    return;
  }

  unlockBound = true;

  const unlock = () => {
    const context = getAudioContext();
    if (!context) {
      return;
    }

    void context.resume().catch(() => {});
    window.removeEventListener(WINDOW_EVENT.POINTER_DOWN, unlock);
    window.removeEventListener(WINDOW_EVENT.KEY_DOWN, unlock);
    unlockBound = false;
  };

  window.addEventListener(WINDOW_EVENT.POINTER_DOWN, unlock, { passive: true });
  window.addEventListener(WINDOW_EVENT.KEY_DOWN, unlock);
}

export function playActionVoice(voice: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(voice);
  const voices = synthesis.getVoices();
  const chineseVoice =
    voices.find((item) =>
      item.lang.toLowerCase().startsWith(LANGUAGE.CHINESE_PREFIX),
    ) ?? null;

  utterance.lang = LANGUAGE.CHINESE_MAINLAND;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 0.96;

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  synthesis.cancel();
  synthesis.speak(utterance);
}
