import {
  CLAIM_ACTION,
  getCurrentClaim,
  getCurrentHumanClaims,
  getCurrentQiangGangCandidate,
  huSummaryText,
  PHASE,
  tileToText,
  winMethodText,
  type GameState,
} from "../mahjongEngine";

/**
 * 生成顶部状态文案，供棋盘元信息区域展示。
 */
export function selectStatusText(state: GameState): string {
  const currentClaim = getCurrentClaim(state);
  const currentHumanClaims = getCurrentHumanClaims(state);
  const qiangGangCandidate = getCurrentQiangGangCandidate(state);

  if (state.phase === PHASE.GAME_OVER) {
    if (!state.winInfo) {
      return "本局结束：流局";
    }

    const winner = state.players[state.winInfo.winner].name;
    const methodText = winMethodText(state.winInfo.method, state.winInfo.specials);
    const huSummary = huSummaryText(state.winInfo.hu);
    const payer =
      typeof state.winInfo.from === "number"
        ? `，由 ${state.players[state.winInfo.from].name} 付分`
        : "";
    const handFanText = `(${huSummary}）总 ${state.winInfo.totalFan} 番`;

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
    if (currentClaim.player === 0 && currentHumanClaims.length > 1) {
      const allActionText = currentHumanClaims
        .map((claim) =>
          claim.action === CLAIM_ACTION.HU
            ? "胡"
            : claim.action === CLAIM_ACTION.MING_GANG
              ? "明杠"
              : "碰",
        )
        .join(" / ");
      return `等待响应：你可${allActionText} ${from} 的 ${tileToText(currentClaim.tile)}`;
    }
    return `等待响应：${actor} 可${actionText} ${from} 的 ${tileToText(currentClaim.tile)}`;
  }

  if (state.phase === PHASE.QIANG_GANG_DECISION && state.qiangGang) {
    const actor = state.players[state.qiangGang.actor].name;
    const candidate =
      qiangGangCandidate === null ? "玩家" : state.players[qiangGangCandidate].name;
    return `等待抢杠胡：${actor} 补杠 ${tileToText(state.qiangGang.tile)}，${candidate} 可胡`;
  }

  const current = state.players[state.currentPlayer].name;
  return `当前行动：${current}`;
}
