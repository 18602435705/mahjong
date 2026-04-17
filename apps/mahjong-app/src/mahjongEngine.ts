import {
  INITIAL_DEAL_PRESET,
  INITIAL_DEAL_PRESET_CONFIG,
  INITIAL_DEAL_PRESET_OPTIONS,
} from "./mock/initialDealPresets";
import type { InitialDealPresetId } from "./mock/initialDealPresets";

export { INITIAL_DEAL_PRESET, INITIAL_DEAL_PRESET_OPTIONS };
export type {
  InitialDealPresetId,
  InitialDealPresetOption,
} from "./mock/initialDealPresets";

export const SUIT = {
  WAN: "W",
  BAMBOO: "T",
  DOT: "B",
} as const;
export type Suit = (typeof SUIT)[keyof typeof SUIT];
export type Tile = `${Suit}${number}`;

export const MELD_TYPE = {
  PENG: "peng",
  MING_GANG: "mingGang",
  AN_GANG: "anGang",
  BU_GANG: "buGang",
} as const;
export type MeldType = (typeof MELD_TYPE)[keyof typeof MELD_TYPE];
type HumanGangType = typeof MELD_TYPE.AN_GANG | typeof MELD_TYPE.BU_GANG;

export interface Meld {
  type: MeldType;
  tile: Tile;
  from?: number;
}

export interface PlayerState {
  id: number;
  name: string;
  isHuman: boolean;
  hand: Tile[];
  justDrawnTile: Tile | null;
  justDrawnFromGang: boolean;
  melds: Meld[];
  discards: Tile[];
  score: number;
}

export type HuType =
  | "pinghu"
  | "dadui"
  | "dandiao"
  | "dasanyuan"
  | "xiaoqi"
  | "haohua"
  | "shuanghaohua"
  | "sanhaohua";
export const HU_OVERLAY = {
  QING_YI_SE: "qingyise",
} as const;
export type HuOverlayType = (typeof HU_OVERLAY)[keyof typeof HU_OVERLAY];
export const WIN_METHOD = {
  ZIMO: "zimo",
  DIAN_PAO: "dianpao",
  QIANG_GANG: "qianggang",
  GANG_SHANG_HUA: "gangshanghua",
} as const;
export type WinMethod = (typeof WIN_METHOD)[keyof typeof WIN_METHOD];
export const HU_SPECIAL = {
  TIAN_HU: "tianhu",
  DI_HU: "dihu",
} as const;
export type HuSpecialType = (typeof HU_SPECIAL)[keyof typeof HU_SPECIAL];

export interface HuResult {
  type: HuType;
  baseFan: number;
  overlays: HuOverlayType[];
  overlayFan: number;
  fan: number;
}

export interface WinInfo {
  winner: number;
  from?: number;
  method: WinMethod;
  specials: HuSpecialType[];
  hu: HuResult;
  totalFan: number;
  tile: Tile;
}

export interface ClaimRequest {
  player: number;
  action: ClaimAction;
  tile: Tile;
  from: number;
}

export interface QiangGangState {
  actor: number;
  tile: Tile;
  candidates: number[];
  index: number;
}

export const CLAIM_ACTION = {
  HU: "hu",
  MING_GANG: "mingGang",
  PENG: "peng",
} as const;
export type ClaimAction = (typeof CLAIM_ACTION)[keyof typeof CLAIM_ACTION];

export const PHASE = {
  PLAYER_TURN: "playerTurn",
  CLAIM_DECISION: "claimDecision",
  QIANG_GANG_DECISION: "qiangGangDecision",
  GAME_OVER: "gameOver",
} as const;
export type Phase = (typeof PHASE)[keyof typeof PHASE];

export interface GameState {
  players: PlayerState[];
  wall: Tile[];
  currentPlayer: number;
  phase: Phase;
  pendingClaims: ClaimRequest[];
  qiangGang: QiangGangState | null;
  lastDiscard: { tile: Tile; from: number } | null;
  logs: string[];
  round: number;
  winner: number | null;
  winInfo: WinInfo | null;
}

export const GAME_ACTION = {
  NEXT_ROUND: "NEXT_ROUND",
  RESET_GAME: "RESET_GAME",
  HUMAN_DISCARD: "HUMAN_DISCARD",
  HUMAN_SELF_HU: "HUMAN_SELF_HU",
  HUMAN_GANG: "HUMAN_GANG",
  HUMAN_CLAIM_DECISION: "HUMAN_CLAIM_DECISION",
  HUMAN_QIANG_GANG_DECISION: "HUMAN_QIANG_GANG_DECISION",
  AI_STEP: "AI_STEP",
} as const;

export type GameAction =
  | { type: typeof GAME_ACTION.NEXT_ROUND; presetId?: InitialDealPresetId }
  | { type: typeof GAME_ACTION.RESET_GAME; presetId?: InitialDealPresetId }
  | { type: typeof GAME_ACTION.HUMAN_DISCARD; tile: Tile }
  | { type: typeof GAME_ACTION.HUMAN_SELF_HU }
  | { type: typeof GAME_ACTION.HUMAN_GANG; gangType: HumanGangType; tile: Tile }
  | {
      type: typeof GAME_ACTION.HUMAN_CLAIM_DECISION;
      accept: boolean;
      claimAction?: ClaimAction;
    }
  | { type: typeof GAME_ACTION.HUMAN_QIANG_GANG_DECISION; accept: boolean }
  | { type: typeof GAME_ACTION.AI_STEP };

const DRAW_SOURCE = {
  NORMAL: "normal",
  GANG: "gang",
} as const;
type DrawSource = (typeof DRAW_SOURCE)[keyof typeof DRAW_SOURCE];

const SUITS: Suit[] = [SUIT.WAN, SUIT.BAMBOO, SUIT.DOT];
const MAX_LOGS = 18;
const PURE_PINGHU_DEFAULT_FAN = 3;
const GANG_SCORE = {
  MING_GANG: 3,
  AN_GANG_PER_OPPONENT: 3,
  BU_GANG_PER_OPPONENT: 3,
} as const;

const HU_TYPE_TEXT: Record<HuType, string> = {
  pinghu: "平胡",
  dadui: "大对", // 别称：对对胡
  dandiao: "单钓",
  dasanyuan: "大三元",
  xiaoqi: "小七", // 别称：七对
  haohua: "豪华", // 别称：龙七对
  shuanghaohua: "双豪华", // 别称：双龙七对
  sanhaohua: "三豪华", // 别称：三龙七对
};

const HU_OVERLAY_TEXT: Record<HuOverlayType, string> = {
  qingyise: "清一色",
};

const BASE_FAN_BY_HU_TYPE: Record<HuType, number> = {
  pinghu: 0,
  dadui: 8,
  dandiao: 15,
  dasanyuan: 20,
  xiaoqi: 10,
  haohua: 20,
  shuanghaohua: 40,
  sanhaohua: 80,
};

const OVERLAY_FAN_BY_TYPE: Record<HuOverlayType, number> = {
  qingyise: 12,
};

const WIN_METHOD_TEXT: Record<WinMethod, string> = {
  zimo: "自摸",
  dianpao: "点炮胡",
  qianggang: "抢杠胡",
  gangshanghua: "杠上花",
};

const HU_SPECIAL_TEXT: Record<HuSpecialType, string> = {
  tianhu: "天胡",
  dihu: "地胡",
};

const METHOD_EXTRA_FAN: Record<WinMethod, number> = {
  zimo: 0,
  dianpao: 0,
  qianggang: 0,
  gangshanghua: 0,
};

const SPECIAL_EXTRA_FAN: Record<HuSpecialType, number> = {
  tianhu: 20,
  dihu: 20,
};

const PLAYER_NAMES = ["你", "AI-右", "AI-上", "AI-左"];

const TILE_TYPES: Tile[] = SUITS.flatMap((suit) =>
  Array.from({ length: 9 }, (_, index) => `${suit}${index + 1}` as Tile),
);

/**
 * 将胡牌类型编码转换为界面展示文案。
 */
export const huTypeText = (type: HuType) => HU_TYPE_TEXT[type];
/**
 * 将叠加番型编码转换为界面展示文案。
 */
export const huOverlayText = (type: HuOverlayType) => HU_OVERLAY_TEXT[type];
/**
 * 将特殊胡牌标记（天胡/地胡）转换为界面展示文案。
 */
export const huSpecialText = (special: HuSpecialType) =>
  HU_SPECIAL_TEXT[special];
/**
 * 根据胡牌方式与特殊胡优先级返回最终展示文案。
 */
export const winMethodText = (
  method: WinMethod,
  specials: HuSpecialType[] = [],
) => {
  if (specials.includes(HU_SPECIAL.TIAN_HU)) {
    return huSpecialText(HU_SPECIAL.TIAN_HU);
  }
  if (specials.includes(HU_SPECIAL.DI_HU)) {
    return huSpecialText(HU_SPECIAL.DI_HU);
  }
  return WIN_METHOD_TEXT[method];
};
/**
 * 获取胡牌方式对应的附加番数。
 */
export const getMethodExtraFan = (method: WinMethod) =>
  METHOD_EXTRA_FAN[method];
/**
 * 获取单个特殊胡标记对应的附加番数。
 */
export const getSpecialExtraFan = (special: HuSpecialType) =>
  SPECIAL_EXTRA_FAN[special];
/**
 * 汇总多个特殊胡标记的附加番数。
 */
export const getSpecialsExtraFan = (specials: HuSpecialType[]) =>
  specials.reduce((sum, special) => sum + getSpecialExtraFan(special), 0);
/**
 * 生成胡牌摘要文案；若含清一色则与主胡型合并展示。
 */
export const huSummaryText = (hu: HuResult) => {
  const hasQingYiSe = hu.overlays.includes(HU_OVERLAY.QING_YI_SE);

  let summary = huTypeText(hu.type);
  if (hasQingYiSe) {
    const qingYiSeByType: Record<HuType, string> = {
      pinghu: "清一色",
      dadui: "清一色大对",
      dandiao: "清一色单钓",
      dasanyuan: "清一色大三元",
      xiaoqi: "清一色小七",
      haohua: "清一色豪华",
      shuanghaohua: "清一色双豪华",
      sanhaohua: "清一色三豪华",
    };
    summary = qingYiSeByType[hu.type];
  }

  return summary;
};

/**
 * 将牌编码转换为中文牌面文本（如“3条”）。
 */
export const tileToText = (tile: Tile): string => {
  const suitLabel: Record<Suit, string> = {
    W: "万",
    T: "条",
    B: "筒",
  };

  return `${tileRank(tile)}${suitLabel[tileSuit(tile)]}`;
};

/**
 * 将副露类型转换为“碰/明杠/暗杠/补杠”文案。
 */
export const meldTypeText = (type: MeldType) => {
  if (type === MELD_TYPE.PENG) return "碰";
  if (type === MELD_TYPE.MING_GANG) return "明杠";
  if (type === MELD_TYPE.AN_GANG) return "暗杠";
  return "补杠";
};

/**
 * 创建新对局初始状态（第 1 局，四家 0 分）。
 */
export const createInitialGameState = (
  presetId: InitialDealPresetId = INITIAL_DEAL_PRESET.RANDOM,
) => createRoundState([0, 0, 0, 0], 1, presetId);

/**
 * 在吃碰杠胡响应阶段返回当前排队中的首个声明请求。
 */
export const getCurrentClaim = (state: GameState): ClaimRequest | null =>
  state.phase === PHASE.CLAIM_DECISION && state.pendingClaims.length > 0
    ? state.pendingClaims[0]
    : null;

/**
 * 返回当前声明阶段队首连续可由指定玩家选择的全部声明动作。
 */
export const getLeadingClaimsForPlayer = (state: GameState, player: number) => {
  if (state.phase !== PHASE.CLAIM_DECISION) {
    return [] as ClaimRequest[];
  }

  const claims: ClaimRequest[] = [];
  for (const claim of state.pendingClaims) {
    if (claim.player !== player) {
      break;
    }
    claims.push(claim);
  }

  return claims;
};

/**
 * 返回当前声明阶段队首连续可由人类玩家（0号位）选择的声明动作。
 */
export const getCurrentHumanClaims = (state: GameState) =>
  getLeadingClaimsForPlayer(state, 0);

/**
 * 在抢杠胡阶段返回当前轮到决策的候选玩家。
 */
export const getCurrentQiangGangCandidate = (
  state: GameState,
): number | null => {
  if (state.phase !== PHASE.QIANG_GANG_DECISION || !state.qiangGang) {
    return null;
  }

  return state.qiangGang.candidates[state.qiangGang.index] ?? null;
};

/**
 * 判断胡牌结果是否为不含叠加番型的纯平胡。
 */
function isPingHuOnly(hu: HuResult) {
  return hu.type === "pinghu" && hu.overlays.length === 0;
}

/**
 * 计算本次胡牌总番数，并拆分方式附加番与平胡保底番明细。
 */
export function calculateWinTotalFan(
  hu: HuResult,
  method: WinMethod,
  specials: HuSpecialType[] = [],
) {
  const methodExtraFan = getMethodExtraFan(method);
  const specialExtraFan = getSpecialsExtraFan(specials);
  const purePingHuBaseFan = hu.baseFan + hu.overlayFan + specialExtraFan;
  const pingHuDefaultMethodFan =
    isPingHuOnly(hu) && purePingHuBaseFan === 0 ? PURE_PINGHU_DEFAULT_FAN : 0;
  const totalFan =
    hu.fan + methodExtraFan + specialExtraFan + pingHuDefaultMethodFan;

  return {
    totalFan,
    methodExtraFan,
    specialExtraFan,
    pingHuDefaultMethodFan,
  };
}

/**
 * 判断是否满足“他家首轮自摸地胡”判定条件。
 */
function isDiHuSelfScenario(state: GameState, actor: number) {
  if (actor === 0) {
    return false;
  }

  const player = state.players[actor];
  return (
    player.justDrawnTile !== null &&
    !player.justDrawnFromGang &&
    player.discards.length === 0 &&
    player.melds.length === 0
  );
}

/**
 * 判断是否满足“他家首轮点炮地胡”判定条件。
 */
function isDiHuClaimScenario(state: GameState, playerIndex: number) {
  if (playerIndex === 0) {
    return false;
  }

  const player = state.players[playerIndex];
  return (
    player.justDrawnTile === null &&
    !player.justDrawnFromGang &&
    player.discards.length === 0 &&
    player.melds.length === 0
  );
}

/**
 * 判断本局是否仍处于无人出牌、无人副露的开局纯净状态。
 */
function isRoundPristine(state: GameState) {
  return state.players.every(
    (player) => player.discards.length === 0 && player.melds.length === 0,
  );
}

/**
 * 解析当前自摸可胡时的胡牌方式与特殊胡标记（杠上花/天胡/地胡）。
 */
function resolveSelfHuContext(
  state: GameState,
  actor: number,
): { method: WinMethod; specials: HuSpecialType[] } | null {
  if (state.phase !== PHASE.PLAYER_TURN || state.currentPlayer !== actor) {
    return null;
  }

  const player = state.players[actor];
  if (player.justDrawnTile === null || player.hand.length % 3 !== 2) {
    return null;
  }

  if (player.justDrawnFromGang) {
    return {
      method: WIN_METHOD.GANG_SHANG_HUA,
      specials: [],
    };
  }

  if (actor === 0 && isRoundPristine(state)) {
    return {
      method: WIN_METHOD.ZIMO,
      specials: [HU_SPECIAL.TIAN_HU],
    };
  }

  if (isDiHuSelfScenario(state, actor)) {
    return {
      method: WIN_METHOD.ZIMO,
      specials: [HU_SPECIAL.DI_HU],
    };
  }

  return {
    method: WIN_METHOD.ZIMO,
    specials: [],
  };
}

/**
 * 获取当前玩家自摸胡可用的胡牌方式；不可胡时返回 null。
 */
export function getSelfHuMethod(
  state: GameState,
  actor: number,
): WinMethod | null {
  return resolveSelfHuContext(state, actor)?.method ?? null;
}

/**
 * 获取当前玩家自摸胡可用的特殊胡标记集合。
 */
export function getSelfHuSpecials(state: GameState, actor: number) {
  return resolveSelfHuContext(state, actor)?.specials ?? [];
}

/**
 * 汇总玩家回合可执行的操作选项（出牌、自摸、暗杠、补杠）。
 */
export const getHumanTurnOptions = (state: GameState) => {
  const human = state.players[0];
  const canAct = state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0;
  const canUseDrawActions =
    canAct && human.justDrawnTile !== null && human.hand.length % 3 === 2;
  const selfHu = canUseDrawActions ? evaluateHu(human.hand, human.melds) : null;
  const selfHuMethod = selfHu ? getSelfHuMethod(state, 0) : null;
  const selfHuSpecials = selfHu ? getSelfHuSpecials(state, 0) : [];

  return {
    canDiscard: canAct,
    selfHu,
    selfHuMethod,
    selfHuSpecials,
    anGangTiles: canUseDrawActions ? getAnGangOptions(human) : [],
    buGangTiles: canUseDrawActions ? getBuGangOptions(human) : [],
  };
};

/**
 * 处理游戏 Action 并驱动完整状态流转。
 */
type NextRoundAction = Extract<GameAction, { type: typeof GAME_ACTION.NEXT_ROUND }>;
type ResetGameAction = Extract<GameAction, { type: typeof GAME_ACTION.RESET_GAME }>;
type HumanDiscardAction = Extract<
  GameAction,
  { type: typeof GAME_ACTION.HUMAN_DISCARD }
>;
type HumanGangAction = Extract<GameAction, { type: typeof GAME_ACTION.HUMAN_GANG }>;
type HumanClaimDecisionAction = Extract<
  GameAction,
  { type: typeof GAME_ACTION.HUMAN_CLAIM_DECISION }
>;
type HumanQiangGangDecisionAction = Extract<
  GameAction,
  { type: typeof GAME_ACTION.HUMAN_QIANG_GANG_DECISION }
>;

const HUMAN_PLAYER_INDEX = 0;

function resolvePresetId(presetId?: InitialDealPresetId) {
  return presetId ?? INITIAL_DEAL_PRESET.RANDOM;
}

function isHumanTurn(state: GameState) {
  return (
    state.phase === PHASE.PLAYER_TURN &&
    state.currentPlayer === HUMAN_PLAYER_INDEX
  );
}

function reduceNextRound(state: GameState, action: NextRoundAction): GameState {
  const scores = state.players.map((player) => player.score);
  return createRoundState(scores, state.round + 1, resolvePresetId(action.presetId));
}

function reduceResetGame(_state: GameState, action: ResetGameAction): GameState {
  return createRoundState([0, 0, 0, 0], 1, resolvePresetId(action.presetId));
}

function reduceHumanDiscard(
  state: GameState,
  action: HumanDiscardAction,
): GameState {
  if (!isHumanTurn(state)) {
    return state;
  }

  return discardTile(state, HUMAN_PLAYER_INDEX, action.tile);
}

function reduceHumanSelfHu(
  state: GameState,
): GameState {
  if (!isHumanTurn(state)) {
    return state;
  }

  return trySelfHu(state, HUMAN_PLAYER_INDEX);
}

function reduceHumanGang(state: GameState, action: HumanGangAction): GameState {
  if (!isHumanTurn(state)) {
    return state;
  }

  if (action.gangType === MELD_TYPE.AN_GANG) {
    return tryAnGang(state, HUMAN_PLAYER_INDEX, action.tile);
  }

  return tryBuGang(state, HUMAN_PLAYER_INDEX, action.tile);
}

function reduceHumanClaimDecision(
  state: GameState,
  action: HumanClaimDecisionAction,
): GameState {
  const claimOptions = getCurrentHumanClaims(state);
  if (claimOptions.length === 0) {
    return state;
  }

  if (action.accept) {
    const claim = action.claimAction
      ? claimOptions.find((option) => option.action === action.claimAction)
      : claimOptions[0];
    if (!claim) {
      return state;
    }
    return acceptClaim(state, claim);
  }

  return passLeadingClaimsForPlayer(state, HUMAN_PLAYER_INDEX);
}

function reduceHumanQiangGangDecision(
  state: GameState,
  action: HumanQiangGangDecisionAction,
): GameState {
  const candidate = getCurrentQiangGangCandidate(state);
  if (candidate !== HUMAN_PLAYER_INDEX) {
    return state;
  }

  if (action.accept) {
    return acceptQiangGangHu(state, HUMAN_PLAYER_INDEX);
  }

  return passQiangGangHu(state);
}

function assertNever(action: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case GAME_ACTION.NEXT_ROUND:
      return reduceNextRound(state, action);
    case GAME_ACTION.RESET_GAME:
      return reduceResetGame(state, action);
    case GAME_ACTION.HUMAN_DISCARD:
      return reduceHumanDiscard(state, action);
    case GAME_ACTION.HUMAN_SELF_HU:
      return reduceHumanSelfHu(state);
    case GAME_ACTION.HUMAN_GANG:
      return reduceHumanGang(state, action);
    case GAME_ACTION.HUMAN_CLAIM_DECISION:
      return reduceHumanClaimDecision(state, action);
    case GAME_ACTION.HUMAN_QIANG_GANG_DECISION:
      return reduceHumanQiangGangDecision(state, action);
    case GAME_ACTION.AI_STEP:
      return runAIStep(state);
    default:
      return assertNever(action);
  }
}

/**
 * 执行 AI 一步决策：响应声明、抢杠胡、自摸/杠判断与出牌选择。
 */
function runAIStep(state: GameState): GameState {
  if (state.phase === PHASE.GAME_OVER) {
    return state;
  }

  if (state.phase === PHASE.CLAIM_DECISION) {
    const claim = getCurrentClaim(state);
    if (!claim || state.players[claim.player].isHuman) {
      return state;
    }

    if (claim.action === CLAIM_ACTION.HU) {
      return acceptClaim(state, claim);
    }

    if (claim.action === CLAIM_ACTION.MING_GANG) {
      return acceptClaim(state, claim);
    }

    const shouldPeng = true;
    return shouldPeng ? acceptClaim(state, claim) : passClaim(state);
  }

  if (state.phase === PHASE.QIANG_GANG_DECISION) {
    const candidate = getCurrentQiangGangCandidate(state);
    if (candidate === null || state.players[candidate].isHuman) {
      return state;
    }

    return acceptQiangGangHu(state, candidate);
  }

  const actor = state.currentPlayer;
  const player = state.players[actor];
  if (player.isHuman) {
    return state;
  }

  const canUseDrawActions =
    player.justDrawnTile !== null && player.hand.length % 3 === 2;
  if (canUseDrawActions) {
    const selfHu = evaluateHu(player.hand, player.melds);
    if (selfHu) {
      const selfHuContext = resolveSelfHuContext(state, actor);
      return settleHu(state, {
        winner: actor,
        method: selfHuContext?.method ?? WIN_METHOD.ZIMO,
        specials: selfHuContext?.specials ?? [],
        tile: player.hand[player.hand.length - 1],
        hu: selfHu,
      });
    }

    const buGangTiles = getBuGangOptions(player);
    if (buGangTiles.length > 0) {
      return tryBuGang(state, actor, buGangTiles[0]);
    }

    const anGangTiles = getAnGangOptions(player);
    if (anGangTiles.length > 0) {
      return tryAnGang(state, actor, anGangTiles[0]);
    }
  }

  if (player.hand.length === 0) {
    return state;
  }

  const discard = pickAIDiscard(player);
  return discardTile(state, actor, discard);
}

/**
 * 创建单局状态：洗牌、发牌、庄家补张，并初始化回合信息。
 */
function createRoundState(
  scores: number[],
  round: number,
  presetId: InitialDealPresetId = INITIAL_DEAL_PRESET.RANDOM,
): GameState {
  if (presetId !== INITIAL_DEAL_PRESET.RANDOM) {
    return createPresetRoundState(scores, round, presetId);
  }

  return createRandomRoundState(scores, round);
}

/**
 * 创建随机发牌单局状态。
 */
function createRandomRoundState(scores: number[], round: number): GameState {
  const players = createPlayers(scores);
  const wall = createWall();

  for (let i = 0; i < 13; i += 1) {
    for (const player of players) {
      const tile = wall.pop();
      if (tile) {
        player.hand.push(tile);
      }
    }
  }

  const dealerTile = wall.pop();
  if (dealerTile) {
    players[0].hand.push(dealerTile);
    players[0].justDrawnTile = dealerTile;
  }

  players.forEach((player) => {
    sortTiles(player.hand);
  });

  const state: GameState = {
    players,
    wall,
    currentPlayer: 0,
    phase: PHASE.PLAYER_TURN,
    pendingClaims: [],
    qiangGang: null,
    lastDiscard: null,
    logs: [],
    round,
    winner: null,
    winInfo: null,
  };

  appendLog(state, `第 ${round} 局开始，庄家是${players[0].name}`);

  return state;
}

/**
 * 创建预设发牌单局状态，用于快速复现测试场景。
 */
function createPresetRoundState(
  scores: number[],
  round: number,
  presetId: Exclude<InitialDealPresetId, typeof INITIAL_DEAL_PRESET.RANDOM>,
): GameState {
  const preset = INITIAL_DEAL_PRESET_CONFIG[presetId];
  const players = createPlayers(scores);

  players.forEach((player, index) => {
    player.hand = [...preset.hands[index]];
    sortTiles(player.hand);
  });

  const humanJustDrawnTile =
    preset.humanJustDrawnTile ?? players[0].hand[players[0].hand.length - 1] ?? null;
  players[0].justDrawnTile = humanJustDrawnTile;

  const wall = createWallFromPreset(preset.hands, preset.wallDrawSequence ?? []);

  const state: GameState = {
    players,
    wall,
    currentPlayer: 0,
    phase: PHASE.PLAYER_TURN,
    pendingClaims: [],
    qiangGang: null,
    lastDiscard: null,
    logs: [],
    round,
    winner: null,
    winInfo: null,
  };

  const presetLabel =
    INITIAL_DEAL_PRESET_OPTIONS.find((option) => option.id === presetId)?.label ??
    presetId;
  appendLog(state, `第 ${round} 局开始（预设：${presetLabel}），庄家是${players[0].name}`);

  return state;
}

/**
 * 按积分创建四家玩家基础状态。
 */
function createPlayers(scores: number[]) {
  const players: PlayerState[] = Array.from({ length: 4 }, (_, index) => ({
    id: index,
    name: PLAYER_NAMES[index],
    isHuman: index === 0,
    hand: [],
    justDrawnTile: null,
    justDrawnFromGang: false,
    melds: [],
    discards: [],
    score: scores[index] ?? 0,
  }));

  return players;
}

/**
 * 基于预设手牌扣减牌张并组装剩余牌墙，可指定后续摸牌序列。
 */
function createWallFromPreset(
  hands: [Tile[], Tile[], Tile[], Tile[]],
  drawSequence: Tile[],
) {
  const counts: Record<Tile, number> = Object.fromEntries(
    TILE_TYPES.map((tile) => [tile, 4]),
  ) as Record<Tile, number>;

  const allUsed = hands.flat();
  for (const tile of allUsed) {
    counts[tile] -= 1;
    if (counts[tile] < 0) {
      throw new Error(`预设手牌超出牌张上限：${tile}`);
    }
  }

  for (const tile of drawSequence) {
    counts[tile] -= 1;
    if (counts[tile] < 0) {
      throw new Error(`预设摸牌序列超出牌张上限：${tile}`);
    }
  }

  const wallBody: Tile[] = [];
  for (const tile of TILE_TYPES) {
    const count = counts[tile];
    for (let index = 0; index < count; index += 1) {
      wallBody.push(tile);
    }
  }

  const wallTail = [...drawSequence].reverse();
  return [...wallBody, ...wallTail];
}

/**
 * 生成并随机打乱一副仅万条筒的牌墙。
 */
function createWall(): Tile[] {
  const wall: Tile[] = [];

  for (const type of TILE_TYPES) {
    for (let i = 0; i < 4; i += 1) {
      wall.push(type);
    }
  }

  for (let i = wall.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [wall[i], wall[j]] = [wall[j], wall[i]];
  }

  return wall;
}

/**
 * 执行出牌：移除手牌、记录弃牌、构建声明队列或推进到下一家回合。
 */
function discardTile(
  baseState: GameState,
  actor: number,
  tile: Tile,
): GameState {
  const state = cloneState(baseState);
  const player = state.players[actor];
  const removed = removeTiles(player.hand, tile, 1);

  if (!removed) {
    return baseState;
  }

  player.discards.push(tile);
  player.justDrawnTile = null;
  player.justDrawnFromGang = false;
  sortTiles(player.hand);
  state.lastDiscard = { tile, from: actor };
  appendLog(state, `${player.name} 打出 ${tileToText(tile)}`);

  const claims = buildClaimQueue(state, tile, actor);
  if (claims.length > 0) {
    state.pendingClaims = claims;
    state.phase = PHASE.CLAIM_DECISION;
    state.qiangGang = null;
    return state;
  }

  return enterTurn(state, nextPlayer(actor), true);
}

/**
 * 按“胡 > 明杠 > 碰”优先级为弃牌构建可声明玩家队列。
 */
function buildClaimQueue(
  state: GameState,
  tile: Tile,
  from: number,
): ClaimRequest[] {
  const hu: ClaimRequest[] = [];
  const mingGang: ClaimRequest[] = [];
  const peng: ClaimRequest[] = [];

  for (let offset = 1; offset <= 3; offset += 1) {
    const player = (from + offset) % 4;
    const target = state.players[player];
    const count = countTile(target.hand, tile);
    const huResult = evaluateHu([...target.hand, tile], target.melds);

    const diHuClaim = huResult ? isDiHuClaimScenario(state, player) : false;
    // 常规点炮仅禁纯平胡，地胡场景放开平胡点炮。
    if (huResult && (!isPingHuOnly(huResult) || diHuClaim)) {
      hu.push({ player, action: CLAIM_ACTION.HU, tile, from });
    }

    if (count >= 3) {
      mingGang.push({ player, action: CLAIM_ACTION.MING_GANG, tile, from });
    }

    if (count >= 2) {
      peng.push({ player, action: CLAIM_ACTION.PENG, tile, from });
    }
  }

  return [...hu, ...mingGang, ...peng];
}

/**
 * 处理当前声明玩家选择“过”，并推进到下一个声明或下家摸牌。
 */
function passClaim(baseState: GameState): GameState {
  const state = cloneState(baseState);
  if (state.pendingClaims.length === 0) {
    return baseState;
  }

  const [current] = state.pendingClaims;
  appendLog(state, `${state.players[current.player].name} 选择过`);
  state.pendingClaims.shift();

  if (state.pendingClaims.length > 0) {
    return state;
  }

  if (!state.lastDiscard) {
    return state;
  }

  return enterTurn(state, nextPlayer(state.lastDiscard.from), true);
}

/**
 * 让指定玩家一次性放弃当前队首连续可选的全部声明动作。
 */
function passLeadingClaimsForPlayer(baseState: GameState, player: number): GameState {
  const leadingClaims = getLeadingClaimsForPlayer(baseState, player);
  if (leadingClaims.length === 0) {
    return baseState;
  }

  const state = cloneState(baseState);
  appendLog(state, `${state.players[player].name} 选择过`);
  state.pendingClaims.splice(0, leadingClaims.length);

  if (state.pendingClaims.length > 0) {
    return state;
  }

  if (!state.lastDiscard) {
    return state;
  }

  return enterTurn(state, nextPlayer(state.lastDiscard.from), true);
}

/**
 * 执行声明通过逻辑（胡/明杠/碰）并更新局面与分数。
 */
function acceptClaim(baseState: GameState, claim: ClaimRequest): GameState {
  if (claim.action === CLAIM_ACTION.HU) {
    const huResult = evaluateHu(
      [...baseState.players[claim.player].hand, claim.tile],
      baseState.players[claim.player].melds,
    );
    const diHuClaim = huResult
      ? isDiHuClaimScenario(baseState, claim.player)
      : false;

    if (!huResult || (isPingHuOnly(huResult) && !diHuClaim)) {
      return passClaim(baseState);
    }

    return settleHu(baseState, {
      winner: claim.player,
      from: claim.from,
      method: WIN_METHOD.DIAN_PAO,
      specials: diHuClaim ? [HU_SPECIAL.DI_HU] : [],
      tile: claim.tile,
      hu: huResult,
    });
  }

  if (claim.action === CLAIM_ACTION.MING_GANG) {
    const state = cloneState(baseState);
    const actor = state.players[claim.player];

    if (!removeTiles(actor.hand, claim.tile, 3)) {
      return passClaim(baseState);
    }

    actor.melds.push({
      type: MELD_TYPE.MING_GANG,
      tile: claim.tile,
      from: claim.from,
    });
    sortTiles(actor.hand);
    settleMingGangScore(state, claim.player, claim.from);
    appendLog(
      state,
      `${actor.name} 明杠 ${tileToText(claim.tile)}，${state.players[claim.from].name} 付 ${GANG_SCORE.MING_GANG} 分`,
    );

    state.pendingClaims = [];
    state.lastDiscard = null;
    state.phase = PHASE.PLAYER_TURN;
    state.currentPlayer = claim.player;

    return enterTurn(state, claim.player, true, DRAW_SOURCE.GANG);
  }

  const state = cloneState(baseState);
  const actor = state.players[claim.player];

  if (!removeTiles(actor.hand, claim.tile, 2)) {
    return passClaim(baseState);
  }

  actor.melds.push({
    type: MELD_TYPE.PENG,
    tile: claim.tile,
    from: claim.from,
  });
  sortTiles(actor.hand);
  appendLog(state, `${actor.name} 碰 ${tileToText(claim.tile)}`);

  state.pendingClaims = [];
  state.lastDiscard = null;
  state.qiangGang = null;
  state.currentPlayer = claim.player;
  state.phase = PHASE.PLAYER_TURN;

  return state;
}

/**
 * 尝试执行当前玩家自摸胡，成功时进入胡牌结算。
 */
function trySelfHu(baseState: GameState, actor: number): GameState {
  const selfHuContext = resolveSelfHuContext(baseState, actor);
  if (!selfHuContext) {
    return baseState;
  }

  const player = baseState.players[actor];
  const hu = evaluateHu(player.hand, player.melds);
  if (!hu) {
    return baseState;
  }

  return settleHu(baseState, {
    winner: actor,
    method: selfHuContext.method,
    specials: selfHuContext.specials,
    tile: player.hand[player.hand.length - 1],
    hu,
  });
}

/**
 * 校验并执行暗杠，完成杠分结算后进入杠后摸牌。
 */
function tryAnGang(baseState: GameState, actor: number, tile: Tile): GameState {
  const state = cloneState(baseState);
  const player = state.players[actor];

  if (state.phase !== PHASE.PLAYER_TURN || state.currentPlayer !== actor) {
    return baseState;
  }

  if (
    player.justDrawnTile === null ||
    countTile(player.hand, tile) < 4 ||
    player.hand.length % 3 !== 2
  ) {
    return baseState;
  }

  removeTiles(player.hand, tile, 4);
  player.melds.push({ type: MELD_TYPE.AN_GANG, tile });
  sortTiles(player.hand);
  settleAnOrBuGangScore(state, actor, GANG_SCORE.AN_GANG_PER_OPPONENT);
  appendLog(
    state,
    `${player.name} 暗杠 ${tileToText(tile)}，其余三家各付 ${GANG_SCORE.AN_GANG_PER_OPPONENT} 分`,
  );

  return enterTurn(state, actor, true, DRAW_SOURCE.GANG);
}

/**
 * 校验并尝试补杠；若存在抢杠胡候选则进入抢杠决策流程。
 */
function tryBuGang(baseState: GameState, actor: number, tile: Tile): GameState {
  if (
    baseState.phase !== PHASE.PLAYER_TURN ||
    baseState.currentPlayer !== actor
  ) {
    return baseState;
  }

  const player = baseState.players[actor];
  const canBuGang =
    player.justDrawnTile !== null &&
    player.hand.length % 3 === 2 &&
    player.melds.some(
      (meld) => meld.type === MELD_TYPE.PENG && meld.tile === tile,
    ) &&
    countTile(player.hand, tile) >= 1;

  if (!canBuGang) {
    return baseState;
  }

  const qiangGangCandidates: number[] = [];
  for (let offset = 1; offset <= 3; offset += 1) {
    const index = (actor + offset) % 4;
    const target = baseState.players[index];
    const huResult = evaluateHu([...target.hand, tile], target.melds);
    if (huResult) {
      qiangGangCandidates.push(index);
    }
  }

  const state = cloneState(baseState);
  if (qiangGangCandidates.length > 0) {
    state.phase = PHASE.QIANG_GANG_DECISION;
    state.qiangGang = {
      actor,
      tile,
      candidates: qiangGangCandidates,
      index: 0,
    };
    state.pendingClaims = [];
    state.lastDiscard = null;
    appendLog(
      state,
      `${state.players[actor].name} 尝试补杠 ${tileToText(tile)}，等待抢杠胡`,
    );
    return state;
  }

  return executeBuGang(state, actor, tile);
}

/**
 * 处理抢杠胡接受：校验可胡后按抢杠胡方式结算。
 */
function acceptQiangGangHu(baseState: GameState, winner: number): GameState {
  if (!baseState.qiangGang) {
    return baseState;
  }

  const { actor, tile } = baseState.qiangGang;
  const hu = evaluateHu(
    [...baseState.players[winner].hand, tile],
    baseState.players[winner].melds,
  );

  if (!hu) {
    return passQiangGangHu(baseState);
  }

  return settleHu(baseState, {
    winner,
    from: actor,
    method: WIN_METHOD.QIANG_GANG,
    specials: [],
    tile,
    hu,
  });
}

/**
 * 处理当前候选玩家放弃抢杠胡，并推进到下一候选或执行补杠。
 */
function passQiangGangHu(baseState: GameState): GameState {
  if (baseState.phase !== PHASE.QIANG_GANG_DECISION || !baseState.qiangGang) {
    return baseState;
  }

  const state = cloneState(baseState);
  const qiangGang = state.qiangGang;
  if (!qiangGang) {
    return baseState;
  }

  const currentCandidate = qiangGang.candidates[qiangGang.index];
  appendLog(state, `${state.players[currentCandidate].name} 放弃抢杠胡`);
  qiangGang.index += 1;

  if (qiangGang.index < qiangGang.candidates.length) {
    return state;
  }

  const actor = qiangGang.actor;
  const tile = qiangGang.tile;
  state.qiangGang = null;
  return executeBuGang(state, actor, tile);
}

/**
 * 正式执行补杠：将碰升级为补杠、结算杠分并摸杠后牌。
 */
function executeBuGang(
  baseState: GameState,
  actor: number,
  tile: Tile,
): GameState {
  const state = cloneState(baseState);
  const player = state.players[actor];

  if (!removeTiles(player.hand, tile, 1)) {
    return baseState;
  }

  const meld = player.melds.find(
    (item) => item.type === MELD_TYPE.PENG && item.tile === tile,
  );
  if (!meld) {
    return baseState;
  }

  meld.type = MELD_TYPE.BU_GANG;
  sortTiles(player.hand);
  settleAnOrBuGangScore(state, actor, GANG_SCORE.BU_GANG_PER_OPPONENT);
  appendLog(
    state,
    `${player.name} 补杠 ${tileToText(tile)}，其余三家各付 ${GANG_SCORE.BU_GANG_PER_OPPONENT} 分`,
  );

  state.qiangGang = null;
  state.pendingClaims = [];
  state.lastDiscard = null;

  return enterTurn(state, actor, true, DRAW_SOURCE.GANG);
}

/**
 * 按胡牌方式与番数结算输赢分，写入胜负信息并结束本局。
 */
function settleHu(
  baseState: GameState,
  options: {
    winner: number;
    from?: number;
    method: WinMethod;
    specials?: HuSpecialType[];
    tile: Tile;
    hu: HuResult;
  },
): GameState {
  const state = cloneState(baseState);
  const { winner, from, method, specials = [], tile, hu } = options;
  const { totalFan, methodExtraFan, pingHuDefaultMethodFan } =
    calculateWinTotalFan(hu, method, specials);
  const methodBonusParts: string[] = [];
  if (methodExtraFan > 0) {
    methodBonusParts.push(`${WIN_METHOD_TEXT[method]} ${methodExtraFan} 番`);
  }
  if (pingHuDefaultMethodFan > 0) {
    methodBonusParts.push(`平胡默认 ${pingHuDefaultMethodFan} 番`);
  }
  for (const special of specials) {
    const specialFan = getSpecialExtraFan(special);
    if (specialFan > 0) {
      methodBonusParts.push(`${huSpecialText(special)} ${specialFan} 番`);
    }
  }
  const methodBonusText =
    methodBonusParts.length > 0 ? ` + ${methodBonusParts.join(" + ")}` : "";
  const fanDetailText = `${huSummaryText(hu)} ${hu.fan} 番${methodBonusText}`;
  const isSelfPayAll =
    method === WIN_METHOD.ZIMO ||
    method === WIN_METHOD.GANG_SHANG_HUA ||
    specials.includes(HU_SPECIAL.TIAN_HU) ||
    (specials.includes(HU_SPECIAL.DI_HU) && typeof from !== "number");

  if (isSelfPayAll) {
    for (let i = 0; i < state.players.length; i += 1) {
      if (i === winner) {
        continue;
      }
      state.players[i].score -= totalFan;
      state.players[winner].score += totalFan;
    }

    appendLog(
      state,
      `${state.players[winner].name} ${winMethodText(method, specials)} ${tileToText(tile)}（${fanDetailText}），共 ${totalFan} 番，三家各付 ${totalFan} 分`,
    );
  } else if (typeof from === "number") {
    state.players[from].score -= totalFan;
    state.players[winner].score += totalFan;

    appendLog(
      state,
      `${state.players[winner].name} ${winMethodText(method, specials)} ${tileToText(tile)}（${fanDetailText}），${state.players[from].name} 付 ${totalFan} 分`,
    );

    state.players[winner].hand.push(tile);
    sortTiles(state.players[winner].hand);
  }

  state.phase = PHASE.GAME_OVER;
  state.currentPlayer = winner;
  state.winner = winner;
  state.winInfo = {
    winner,
    from,
    method,
    specials,
    hu,
    totalFan,
    tile,
  };
  state.pendingClaims = [];
  state.qiangGang = null;
  state.lastDiscard = null;

  return state;
}

/**
 * 切换到指定玩家回合并按需摸牌；牌墙耗尽时判定流局结束。
 */
function enterTurn(
  baseState: GameState,
  playerIndex: number,
  shouldDraw: boolean,
  drawSource: DrawSource = DRAW_SOURCE.NORMAL,
): GameState {
  const state = cloneState(baseState);
  for (const player of state.players) {
    player.justDrawnTile = null;
    player.justDrawnFromGang = false;
  }

  state.currentPlayer = playerIndex;
  state.phase = PHASE.PLAYER_TURN;
  state.pendingClaims = [];
  state.qiangGang = null;
  state.lastDiscard = null;

  if (!shouldDraw) {
    return state;
  }

  const drawn = state.wall.pop();
  if (!drawn) {
    appendLog(state, "牌墙摸完，流局（无流局结算）");
    state.phase = PHASE.GAME_OVER;
    state.winner = null;
    state.winInfo = null;
    return state;
  }

  const player = state.players[playerIndex];
  player.hand.push(drawn);
  player.justDrawnTile = drawn;
  player.justDrawnFromGang = drawSource === DRAW_SOURCE.GANG;
  sortTiles(player.hand);
  appendLog(state, `${player.name} 摸牌`);

  return state;
}

/**
 * 结算明杠分：放杠者向杠牌者单独支付。
 */
function settleMingGangScore(state: GameState, actor: number, from: number) {
  state.players[actor].score += GANG_SCORE.MING_GANG;
  state.players[from].score -= GANG_SCORE.MING_GANG;
}

/**
 * 结算暗杠/补杠分：其余三家分别向杠牌者支付。
 */
function settleAnOrBuGangScore(
  state: GameState,
  actor: number,
  scorePerOpponent: number,
) {
  for (let i = 0; i < state.players.length; i += 1) {
    if (i === actor) {
      continue;
    }
    state.players[i].score -= scorePerOpponent;
    state.players[actor].score += scorePerOpponent;
  }
}

/**
 * 返回玩家当前可暗杠的牌列表（手中恰好四张）。
 */
function getAnGangOptions(player: PlayerState): Tile[] {
  const counts = countTiles(player.hand);
  return TILE_TYPES.filter((tile) => counts[tile] === 4);
}

/**
 * 返回玩家当前可补杠的牌列表（已有碰且手中还有同牌）。
 */
function getBuGangOptions(player: PlayerState): Tile[] {
  return player.melds
    .filter((meld) => meld.type === MELD_TYPE.PENG)
    .map((meld) => meld.tile)
    .filter((tile) => countTile(player.hand, tile) >= 1);
}

/**
 * 尝试按标准和牌结构（面子+将）评估可胡，并识别大对可能。
 */
function tryEvaluateStandardHu(hand: Tile[], melds: Meld[]) {
  const openMeldCount = melds.length;
  const meldNeed = 4 - openMeldCount;
  const required = meldNeed * 3 + 2;

  if (meldNeed < 0 || hand.length !== required) {
    return {
      standardWin: false,
      dadui: false,
    };
  }

  const counts = toCountArray(hand);
  let standardWin = false;
  let dadui = false;

  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] < 2) {
      continue;
    }

    counts[i] -= 2;

    if (canFormMelds(counts, meldNeed)) {
      standardWin = true;
    }

    if (canFormTripletsOnly(counts, meldNeed)) {
      dadui = true;
    }

    counts[i] += 2;

    if (standardWin && dadui) {
      break;
    }
  }

  return {
    standardWin,
    dadui,
  };
}

/**
 * 综合评估手牌胡型与番数，支持平胡、大对、小七及清一色叠加。
 */
export function evaluateHu(hand: Tile[], melds: Meld[]): HuResult | null {
  const sortedHand = [...hand];
  sortTiles(sortedHand);

  const xiaoqiInfo = getXiaoQiInfo(sortedHand, melds);
  const { standardWin, dadui } = tryEvaluateStandardHu(sortedHand, melds);

  if (!xiaoqiInfo.valid && !standardWin) {
    return null;
  }

  let type: HuType = "pinghu";
  if (xiaoqiInfo.valid) {
    if (xiaoqiInfo.quadPairCount >= 3) {
      type = "sanhaohua";
    } else if (xiaoqiInfo.quadPairCount >= 2) {
      type = "shuanghaohua";
    } else if (xiaoqiInfo.quadPairCount >= 1) {
      type = "haohua";
    } else {
      type = "xiaoqi";
    }
  } else if (dadui) {
    if (sortedHand.length === 2) {
      type = "dandiao";
    } else {
      type = melds.length === 0 ? "dasanyuan" : "dadui";
    }
  }

  const overlays: HuOverlayType[] = [];
  if (isQingYiSe(sortedHand, melds)) {
    overlays.push(HU_OVERLAY.QING_YI_SE);
  }

  const baseFan = BASE_FAN_BY_HU_TYPE[type];
  const overlayFan = overlays.reduce(
    (sum, overlay) => sum + OVERLAY_FAN_BY_TYPE[overlay],
    0,
  );

  return {
    type,
    baseFan,
    overlays,
    overlayFan,
    fan: baseFan + overlayFan,
  };
}

/**
 * 判断是否构成小七对，并统计豪华小七所需的四张对子数量。
 */
function getXiaoQiInfo(hand: Tile[], melds: Meld[]) {
  if (melds.length > 0 || hand.length !== 14) {
    return {
      valid: false,
      quadPairCount: 0,
    };
  }

  const counts = countTiles(hand);
  let pairCount = 0;
  let quadPairCount = 0;

  for (const tile of TILE_TYPES) {
    const value = counts[tile];
    if (value === 0) {
      continue;
    }

    if (value % 2 !== 0) {
      return {
        valid: false,
        quadPairCount: 0,
      };
    }

    pairCount += value / 2;
    if (value >= 4) {
      quadPairCount += 1;
    }
  }

  return {
    valid: pairCount === 7,
    quadPairCount,
  };
}

/**
 * 判断手牌与副露是否全部为同一花色。
 */
function isQingYiSe(hand: Tile[], melds: Meld[]) {
  const tiles = [...hand, ...melds.map((meld) => meld.tile)];
  if (tiles.length === 0) {
    return false;
  }

  const firstSuit = tileSuit(tiles[0]);
  return tiles.every((tile) => tileSuit(tile) === firstSuit);
}

/**
 * 通过记忆化搜索判断剩余牌张能否拆成指定数量的顺子/刻子。
 */
function canFormMelds(counts: number[], meldNeed: number) {
  const memo = new Map<string, boolean>();

  /**
   * 递归尝试拆分刻子或顺子，作为 canFormMelds 的搜索核心。
   */
  const dfs = (need: number): boolean => {
    if (need === 0) {
      return counts.every((value) => value === 0);
    }

    const key = `${need}|${counts.join(",")}`;
    const memoValue = memo.get(key);
    if (typeof memoValue === "boolean") {
      return memoValue;
    }

    let first = -1;
    for (let i = 0; i < counts.length; i += 1) {
      if (counts[i] > 0) {
        first = i;
        break;
      }
    }

    if (first === -1) {
      memo.set(key, need === 0);
      return need === 0;
    }

    let success = false;

    if (counts[first] >= 3) {
      counts[first] -= 3;
      success = dfs(need - 1);
      counts[first] += 3;
      if (success) {
        memo.set(key, true);
        return true;
      }
    }

    const rank = first % 9;
    if (rank <= 6 && counts[first + 1] > 0 && counts[first + 2] > 0) {
      counts[first] -= 1;
      counts[first + 1] -= 1;
      counts[first + 2] -= 1;
      success = dfs(need - 1);
      counts[first] += 1;
      counts[first + 1] += 1;
      counts[first + 2] += 1;
      if (success) {
        memo.set(key, true);
        return true;
      }
    }

    memo.set(key, false);
    return false;
  };

  return dfs(meldNeed);
}

/**
 * 判断剩余牌是否可全部按刻子拆分（用于大对判定）。
 */
function canFormTripletsOnly(counts: number[], meldNeed: number) {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total !== meldNeed * 3) {
    return false;
  }

  return counts.every((value) => value % 3 === 0);
}

/**
 * 遍历手牌并选择启发式评分最高的一张作为 AI 出牌。
 */
function pickAIDiscard(player: PlayerState): Tile {
  const counts = countTiles(player.hand);
  let bestTile = player.hand[0];
  let bestScore = -Infinity;

  for (const tile of player.hand) {
    const score = evaluateDiscardScore(tile, counts);
    if (score > bestScore) {
      bestScore = score;
      bestTile = tile;
    }
  }

  return bestTile;
}

/**
 * 按搭子关系、对子价值与边张特性计算 AI 出牌启发式分值。
 */
function evaluateDiscardScore(tile: Tile, counts: Record<Tile, number>) {
  const suit = tileSuit(tile);
  const rank = tileRank(tile);
  const selfCount = counts[tile];

  let score = 0;

  if (selfCount >= 2) {
    score -= 2;
  }

  const prev1 = rank > 1 ? counts[`${suit}${rank - 1}` as Tile] : 0;
  const next1 = rank < 9 ? counts[`${suit}${rank + 1}` as Tile] : 0;
  const prev2 = rank > 2 ? counts[`${suit}${rank - 2}` as Tile] : 0;
  const next2 = rank < 8 ? counts[`${suit}${rank + 2}` as Tile] : 0;

  if (prev1 > 0) {
    score -= 1;
  }
  if (next1 > 0) {
    score -= 1;
  }
  if (prev2 > 0) {
    score -= 0.35;
  }
  if (next2 > 0) {
    score -= 0.35;
  }

  if (selfCount === 1 && prev1 === 0 && next1 === 0) {
    score += 2;
  }

  if (rank === 1 || rank === 9) {
    score += 1;
  } else if (rank === 2 || rank === 8) {
    score += 0.5;
  }

  score += tileIndex(tile) * 0.0001;
  return score;
}

/**
 * 将日志追加到顶部并截断到最大保留条数。
 */
function appendLog(state: GameState, message: string) {
  state.logs.unshift(message);
  if (state.logs.length > MAX_LOGS) {
    state.logs = state.logs.slice(0, MAX_LOGS);
  }
}

/**
 * 获取当前玩家的下家索引。
 */
function nextPlayer(index: number) {
  return (index + 1) % 4;
}

/**
 * 从手牌中移除指定数量的目标牌，并返回是否移除成功。
 */
function removeTiles(hand: Tile[], tile: Tile, count: number) {
  let remaining = count;

  for (let i = hand.length - 1; i >= 0; i -= 1) {
    if (hand[i] === tile) {
      hand.splice(i, 1);
      remaining -= 1;
      if (remaining === 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 统计某张目标牌在手牌中的出现次数。
 */
function countTile(hand: Tile[], tile: Tile) {
  let count = 0;
  for (const item of hand) {
    if (item === tile) {
      count += 1;
    }
  }
  return count;
}

/**
 * 统计手牌中全部牌型的数量分布。
 */
function countTiles(hand: Tile[]) {
  const counts = Object.fromEntries(
    TILE_TYPES.map((tile) => [tile, 0]),
  ) as Record<Tile, number>;

  for (const tile of hand) {
    counts[tile] += 1;
  }

  return counts;
}

/**
 * 将手牌转换为 27 位计数数组，便于胡牌算法计算。
 */
function toCountArray(hand: Tile[]) {
  const counts = Array.from({ length: 27 }, () => 0);

  for (const tile of hand) {
    counts[tileIndex(tile)] += 1;
  }

  return counts;
}

/**
 * 提取牌编码的花色部分。
 */
function tileSuit(tile: Tile): Suit {
  return tile[0] as Suit;
}

/**
 * 提取牌编码的数字点数部分。
 */
function tileRank(tile: Tile): number {
  return Number(tile.slice(1));
}

/**
 * 将牌编码映射为 0-26 的顺序索引。
 */
function tileIndex(tile: Tile): number {
  const suitOffset =
    tileSuit(tile) === SUIT.WAN ? 0 : tileSuit(tile) === SUIT.BAMBOO ? 9 : 18;
  return suitOffset + tileRank(tile) - 1;
}

/**
 * 按统一索引规则对牌数组原地排序。
 */
function sortTiles(tiles: Tile[]) {
  tiles.sort((a, b) => tileIndex(a) - tileIndex(b));
}

/**
 * 深拷贝游戏状态，保证 reducer 更新过程不直接改动原状态。
 */
function cloneState(state: GameState): GameState {
  return structuredClone(state);
}
