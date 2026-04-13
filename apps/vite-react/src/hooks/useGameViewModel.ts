import { useCallback, useMemo, useState, type Dispatch } from "react";
import {
  calculateWinTotalFan,
  CLAIM_ACTION,
  GAME_ACTION,
  getCurrentClaim,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  getSelfHuMethod,
  getSelfHuSpecials,
  huSummaryText,
  PHASE,
  tileToText,
  WIN_METHOD,
  winMethodText,
  type GameAction,
  type GameState,
  type HuSpecialType,
  type Tile,
  type WinMethod,
} from "../mahjongEngine";

type SelectedDiscard = {
  key: string;
  handSignature: string;
};

/**
 * 聚合对局页面的派生状态与交互回调，简化 App 容器层。
 */
export function useGameViewModel(
  state: GameState,
  dispatch: Dispatch<GameAction>,
) {
  const [selectedDiscard, setSelectedDiscard] = useState<SelectedDiscard | null>(
    null,
  );

  const humanOptions = useMemo(() => getHumanTurnOptions(state), [state]);
  const currentClaim = useMemo(() => getCurrentClaim(state), [state]);
  const qiangGangCandidate = useMemo(
    () => getCurrentQiangGangCandidate(state),
    [state],
  );

  const statusText = useMemo(() => {
    if (state.phase === PHASE.GAME_OVER) {
      if (!state.winInfo) {
        return "本局结束：流局";
      }

      const winner = state.players[state.winInfo.winner].name;
      const methodText = winMethodText(
        state.winInfo.method,
        state.winInfo.specials,
      );
      const huSummary = huSummaryText(state.winInfo.hu);
      const winFanDetail = calculateWinTotalFan(
        state.winInfo.hu,
        state.winInfo.method,
        state.winInfo.specials,
      );
      const displayedHandFan =
        state.winInfo.hu.fan + winFanDetail.pingHuDefaultMethodFan;
      const payer =
        typeof state.winInfo.from === "number"
          ? `，由 ${state.players[state.winInfo.from].name} 付分`
          : "";
      const handFanText =
        winFanDetail.pingHuDefaultMethodFan > 0
          ? `${huSummary} ${state.winInfo.totalFan} 番`
          : `${huSummary} ${displayedHandFan} 番（总 ${state.winInfo.totalFan} 番）`;

      return `${winner} ${methodText} ${tileToText(state.winInfo.tile)} · ${handFanText}${payer}`;
    }

    if (state.phase === PHASE.CLAIM_DECISION && currentClaim) {
      const actor = state.players[currentClaim.player].name;
      const from = state.players[currentClaim.from].name;
      const actionText =
        currentClaim.action === CLAIM_ACTION.HU
          ? "胡"
          : currentClaim.action === CLAIM_ACTION.MING_GANG
            ? "明杠"
            : "碰";
      return `等待响应：${actor} 可${actionText} ${from} 的 ${tileToText(currentClaim.tile)}`;
    }

    if (state.phase === PHASE.QIANG_GANG_DECISION && state.qiangGang) {
      const actor = state.players[state.qiangGang.actor].name;
      const candidate =
        qiangGangCandidate === null
          ? "玩家"
          : state.players[qiangGangCandidate].name;
      return `等待抢杠胡：${actor} 补杠 ${tileToText(state.qiangGang.tile)}，${candidate} 可胡`;
    }

    const current = state.players[state.currentPlayer].name;
    return `当前行动：${current}`;
  }, [state, currentClaim, qiangGangCandidate]);

  const humanHandSignature = state.players[0].hand.join("|");
  const humanSelfHuMethod: WinMethod =
    humanOptions.selfHuMethod ?? getSelfHuMethod(state, 0) ?? WIN_METHOD.ZIMO;
  const humanSelfHuSpecials: HuSpecialType[] =
    humanOptions.selfHuSpecials ?? getSelfHuSpecials(state, 0);

  const activeSelectedDiscardKey =
    humanOptions.canDiscard &&
    selectedDiscard?.handSignature === humanHandSignature
      ? selectedDiscard.key
      : null;

  /**
   * 处理玩家手牌点击：首次选中，二次点击同牌时执行出牌。
   */
  const handleHumanTileClick = useCallback(
    (tile: Tile, index: number) => {
      if (!humanOptions.canDiscard) {
        return;
      }

      const key = `${tile}-${index}`;
      if (activeSelectedDiscardKey === key) {
        dispatch({ type: GAME_ACTION.HUMAN_DISCARD, tile });
        setSelectedDiscard(null);
        return;
      }

      setSelectedDiscard({
        key,
        handSignature: humanHandSignature,
      });
    },
    [humanOptions.canDiscard, activeSelectedDiscardKey, dispatch, humanHandSignature],
  );

  return {
    statusText,
    humanOptions,
    currentClaim,
    qiangGangCandidate,
    humanSelfHuMethod,
    humanSelfHuSpecials,
    activeSelectedDiscardKey,
    handleHumanTileClick,
  };
}
