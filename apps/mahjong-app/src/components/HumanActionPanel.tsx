import "./HumanActionPanel.css";
import ClaimDecisionActions from "./ClaimDecisionActions";
import PlayerTurnActions from "./PlayerTurnActions";
import QiangGangActions from "./QiangGangActions";
import {
  getCurrentHumanClaims,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  getSelfHuMethod,
  getSelfHuSpecials,
  PHASE,
  WIN_METHOD,
} from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";

type HumanActionPanelProps = {
  inline?: boolean;
};

/**
 * 渲染人类玩家的可执行动作按钮（胡/杠/碰/过等）。
 */
function HumanActionPanel({ inline = false }: HumanActionPanelProps) {
  const state = useGameStore((store) => store.game);
  const dispatch = useGameStore((store) => store.dispatch);

  const currentHumanClaims = getCurrentHumanClaims(state);
  const qiangGangCandidate = getCurrentQiangGangCandidate(state);
  const humanOptions = getHumanTurnOptions(state);
  const humanSelfHuMethod =
    humanOptions.selfHuMethod ?? getSelfHuMethod(state, 0) ?? WIN_METHOD.ZIMO;
  const humanSelfHuSpecials =
    humanOptions.selfHuSpecials ?? getSelfHuSpecials(state, 0);

  const isHumanActionPending =
    (state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0) ||
    (state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0) ||
    (state.phase === PHASE.QIANG_GANG_DECISION && qiangGangCandidate === 0);

  if (!isHumanActionPending) {
    return null;
  }

  return (
    <section className={inline ? "action-inline" : "action-float"} aria-live="polite">
      {state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0 && (
        <PlayerTurnActions
          humanOptions={humanOptions}
          humanSelfHuMethod={humanSelfHuMethod}
          humanSelfHuSpecials={humanSelfHuSpecials}
          dispatch={dispatch}
        />
      )}

      {state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0 && (
        <ClaimDecisionActions currentClaims={currentHumanClaims} dispatch={dispatch} />
      )}

      {state.phase === PHASE.QIANG_GANG_DECISION &&
        qiangGangCandidate === 0 &&
        state.qiangGang && (
          <QiangGangActions tile={state.qiangGang.tile} dispatch={dispatch} />
        )}
    </section>
  );
}

export default HumanActionPanel;
