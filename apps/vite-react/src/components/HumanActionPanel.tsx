import "./HumanActionPanel.css";
import type { Dispatch } from "react";
import ClaimDecisionActions from "./ClaimDecisionActions";
import PlayerTurnActions from "./PlayerTurnActions";
import QiangGangActions from "./QiangGangActions";
import {
  PHASE,
  getHumanTurnOptions,
  type ClaimRequest,
  type GameAction,
  type GameState,
  type HuSpecialType,
  type WinMethod,
} from "../mahjongEngine";

type HumanActionPanelProps = {
  state: GameState;
  currentClaim: ClaimRequest | null;
  qiangGangCandidate: number | null;
  humanOptions: ReturnType<typeof getHumanTurnOptions>;
  humanSelfHuMethod: WinMethod;
  humanSelfHuSpecials: HuSpecialType[];
  dispatch: Dispatch<GameAction>;
};

/**
 * 渲染人类玩家的可执行动作面板（出牌提示、胡/杠/碰/过等）。
 */
function HumanActionPanel(props: HumanActionPanelProps) {
  const {
    state,
    currentClaim,
    qiangGangCandidate,
    humanOptions,
    humanSelfHuMethod,
    humanSelfHuSpecials,
    dispatch,
  } = props;
  const isHumanActionPending =
    (state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0) ||
    (state.phase === PHASE.CLAIM_DECISION && currentClaim?.player === 0) ||
    (state.phase === PHASE.QIANG_GANG_DECISION && qiangGangCandidate === 0);

  if (!isHumanActionPending) {
    return null;
  }

  return (
    <section className="action-float" aria-live="polite">
      <div className="action-panel action-panel-floating">
        <h2>操作</h2>
        {state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0 && (
          <PlayerTurnActions
            humanOptions={humanOptions}
            humanSelfHuMethod={humanSelfHuMethod}
            humanSelfHuSpecials={humanSelfHuSpecials}
            dispatch={dispatch}
          />
        )}

        {state.phase === PHASE.CLAIM_DECISION && currentClaim?.player === 0 && (
          <ClaimDecisionActions currentClaim={currentClaim} dispatch={dispatch} />
        )}

        {state.phase === PHASE.QIANG_GANG_DECISION &&
          qiangGangCandidate === 0 &&
          state.qiangGang && (
            <QiangGangActions tile={state.qiangGang.tile} dispatch={dispatch} />
          )}
      </div>
    </section>
  );
}

export default HumanActionPanel;
