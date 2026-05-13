import {
  HU_SPECIAL,
  MELD_TYPE,
  SUIT,
  WIN_METHOD,
  huSummaryText,
  type GameState,
  type Meld,
  type Tile,
} from "../mahjongEngine";

const VOICE_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

/**
 * 将牌编码转换为语音播报文本（如“一万”“九筒”）。
 */
function tileToVoiceText(tile: Tile) {
  const suit = tile[0];
  const rank = Number(tile.slice(1));
  const numberText = VOICE_NUMBERS[rank - 1] ?? `${rank}`;
  const suitText =
    suit === SUIT.WAN ? "万" : suit === SUIT.BAMBOO ? "条" : "筒";
  return `${numberText}${suitText}`;
}

/**
 * 比较前后状态的副露列表，找出本次状态更新中新出现或发生变化的副露。
 */
function detectMeldChange(
  prevState: GameState,
  nextState: GameState,
): Meld | null {
  for (let index = 0; index < nextState.players.length; index += 1) {
    const prevMelds = prevState.players[index].melds;
    const nextMelds = nextState.players[index].melds;

    for (let meldIndex = 0; meldIndex < nextMelds.length; meldIndex += 1) {
      const nextMeld = nextMelds[meldIndex];
      const prevMeld = prevMelds[meldIndex];

      if (!prevMeld) {
        return nextMeld;
      }

      if (prevMeld.type !== nextMeld.type || prevMeld.tile !== nextMeld.tile) {
        return nextMeld;
      }
    }
  }

  return null;
}

/**
 * 比较前后状态的弃牌区，识别本次新增的弃牌。
 */
function detectDiscardedTile(
  prevState: GameState,
  nextState: GameState,
): Tile | null {
  for (let index = 0; index < nextState.players.length; index += 1) {
    const prevDiscards = prevState.players[index].discards;
    const nextDiscards = nextState.players[index].discards;
    if (nextDiscards.length > prevDiscards.length) {
      return nextDiscards[nextDiscards.length - 1] ?? null;
    }
  }

  return null;
}

/**
 * 根据状态变化推断需要播报的语音内容（胡牌、副露或打牌）。
 */
export function detectActionVoice(prevState: GameState, nextState: GameState) {
  if (prevState.round !== nextState.round) {
    return null;
  }

  if (!prevState.winInfo && nextState.winInfo) {
    const tileText = tileToVoiceText(nextState.winInfo.tile);
    const huSummaryVoiceRaw = huSummaryText(nextState.winInfo.hu);
    const huSummaryVoice =
      huSummaryVoiceRaw === "平胡" ? "" : huSummaryVoiceRaw;
    if (nextState.winInfo.specials.includes(HU_SPECIAL.TIAN_HU)) {
      return huSummaryVoice
        ? `天胡 ${tileText}，${huSummaryVoice}`
        : `天胡 ${tileText}`;
    }
    if (nextState.winInfo.specials.includes(HU_SPECIAL.DI_HU)) {
      return huSummaryVoice
        ? `地胡 ${tileText}，${huSummaryVoice}`
        : `地胡 ${tileText}`;
    }
    if (nextState.winInfo.method === WIN_METHOD.ZIMO) {
      return huSummaryVoice
        ? `自摸 ${tileText}，${huSummaryVoice}`
        : `自摸 ${tileText}`;
    }
    if (nextState.winInfo.method === WIN_METHOD.GANG_SHANG_HUA) {
      return huSummaryVoice
        ? `杠上花 ${tileText}，${huSummaryVoice}`
        : `杠上花 ${tileText}`;
    }
    if (nextState.winInfo.method === WIN_METHOD.QIANG_GANG) {
      return huSummaryVoice
        ? `抢杠胡 ${tileText}，${huSummaryVoice}`
        : `抢杠胡 ${tileText}`;
    }
    return huSummaryVoice
      ? `胡 ${tileText}，${huSummaryVoice}`
      : `胡 ${tileText}`;
  }

  const meld = detectMeldChange(prevState, nextState);
  if (meld) {
    const tileText = tileToVoiceText(meld.tile);
    if (meld.type === MELD_TYPE.PENG) {
      return `碰 ${tileText}`;
    }
    if (meld.type === MELD_TYPE.MING_GANG) {
      return `杠 ${tileText}`; // 明杠别名：杠
    }
    if (meld.type === MELD_TYPE.AN_GANG) {
      return "暗杠";
    }
    return `转弯杠 ${tileText}`; // 补杠别名：转弯杠
  }

  const discarded = detectDiscardedTile(prevState, nextState);
  if (discarded) {
    return tileToVoiceText(discarded);
  }

  return null;
}
