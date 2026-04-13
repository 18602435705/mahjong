import { useEffect, type Dispatch } from "react";
import {
  GAME_ACTION,
  PHASE,
  type ClaimRequest,
  type GameAction,
  type GameState,
} from "../mahjongEngine";

const AI_DISCARD_DELAY_MS = 1500;
const AI_RESPONSE_DELAY_MS = 1000;

/**
 * 在 AI 托管阶段按不同相位延时调度 AI_STEP。
 */
export function useAiStep(
  state: GameState,
  currentClaim: ClaimRequest | null,
  qiangGangCandidate: number | null,
  dispatch: Dispatch<GameAction>,
) {
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
