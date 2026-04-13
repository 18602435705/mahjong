import { useEffect, useRef } from "react";
import { playActionVoice } from "../actionAudio";
import { type GameState } from "../mahjongEngine";
import { detectActionVoice } from "../utils/actionVoice";

/**
 * 监听状态变化并在关键动作发生时播报语音。
 */
export function useActionVoice(state: GameState) {
  const previousStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const previous = previousStateRef.current;
    if (previous) {
      const voice = detectActionVoice(previous, state);
      if (voice) {
        playActionVoice(voice);
      }
    }

    previousStateRef.current = state;
  }, [state]);
}
