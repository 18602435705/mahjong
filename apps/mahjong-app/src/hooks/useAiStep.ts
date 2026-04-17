import { useEffect } from "react";
import {
  GAME_ACTION,
  PHASE,
  getCurrentClaim,
  getCurrentQiangGangCandidate,
} from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";

const AI_DISCARD_DELAY_MS = 1500;
const AI_RESPONSE_DELAY_MS = 1000;

/**
 * 在 AI 托管阶段按不同相位延时调度 AI_STEP。
 */
export function useAiStep() {
  const state = useGameStore((store) => store.game);
  const dispatch = useGameStore((store) => store.dispatch);
  const currentClaim = getCurrentClaim(state);
  const qiangGangCandidate = getCurrentQiangGangCandidate(state);

  useEffect(() => {
    if (state.phase === PHASE.GAME_OVER) {
      return;
    }

    const shouldRunAI =
      (state.phase === PHASE.PLAYER_TURN &&
        !state.players[state.currentPlayer].isHuman) ||
      (state.phase === PHASE.CLAIM_DECISION &&
        currentClaim !== null &&
        !state.players[currentClaim.player].isHuman) ||
      (state.phase === PHASE.QIANG_GANG_DECISION &&
        qiangGangCandidate !== null &&
        !state.players[qiangGangCandidate].isHuman);

    if (!shouldRunAI) {
      return;
    }

    const aiDelay =
      state.phase === PHASE.PLAYER_TURN
        ? AI_DISCARD_DELAY_MS
        : AI_RESPONSE_DELAY_MS;

    const timer = window.setTimeout(() => {
      dispatch({ type: GAME_ACTION.AI_STEP });
    }, aiDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state, currentClaim, qiangGangCandidate, dispatch]);
}
