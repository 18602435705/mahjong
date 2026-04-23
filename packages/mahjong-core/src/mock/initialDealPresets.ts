type PresetSuit = "W" | "T" | "B";
type PresetTile = `${PresetSuit}${number}`;

export const INITIAL_DEAL_PRESET = {
  RANDOM: "random",
  SELF_HU: "selfHu",
  AN_GANG: "anGang",
  SELF_HU_AN_GANG: "selfHuAnGang",
  DEALER_TENPAI: "dealerTenpai",
  AI_MING_GANG: "aiMingGang",
  HUMAN_MULTI_CLAIM: "humanMultiClaim",
} as const;
export type InitialDealPresetId =
  (typeof INITIAL_DEAL_PRESET)[keyof typeof INITIAL_DEAL_PRESET];

export type InitialDealPresetOption = {
  id: InitialDealPresetId;
  label: string;
};

type InitialDealPresetConfig = {
  hands: [PresetTile[], PresetTile[], PresetTile[], PresetTile[]];
  humanJustDrawnTile?: PresetTile;
  wallDrawSequence?: PresetTile[];
};

export const INITIAL_DEAL_PRESET_OPTIONS: InitialDealPresetOption[] = [
  { id: INITIAL_DEAL_PRESET.RANDOM, label: "随机发牌" },
  { id: INITIAL_DEAL_PRESET.SELF_HU, label: "你可自摸（开局）" },
  { id: INITIAL_DEAL_PRESET.AN_GANG, label: "你可暗杠（开局）" },
  { id: INITIAL_DEAL_PRESET.SELF_HU_AN_GANG, label: "你可自摸+暗杠（开局）" },
  { id: INITIAL_DEAL_PRESET.DEALER_TENPAI, label: "庄家开场听牌" },
  { id: INITIAL_DEAL_PRESET.AI_MING_GANG, label: "测试 AI 明杠（开局）" },
  { id: INITIAL_DEAL_PRESET.HUMAN_MULTI_CLAIM, label: "测试同屏胡/杠/碰（先打9筒）" },
];

export const INITIAL_DEAL_PRESET_CONFIG: Record<
  Exclude<InitialDealPresetId, typeof INITIAL_DEAL_PRESET.RANDOM>,
  InitialDealPresetConfig
> = {
  [INITIAL_DEAL_PRESET.SELF_HU]: {
    hands: [
      [
        "W1",
        "W1",
        "W1",
        "W2",
        "W2",
        "W2",
        "W3",
        "W3",
        "W3",
        "B1",
        "B2",
        "B3",
        "T9",
        "T9",
      ],
      ["W4", "W4", "W5", "W5", "W6", "W6", "W7", "B4", "B5", "B6", "T1", "T2", "T3"],
      ["W7", "W8", "W9", "B1", "B1", "B2", "B2", "B3", "T4", "T5", "T6", "T7", "T8"],
      ["W3", "W4", "W5", "B4", "B5", "B6", "B7", "B8", "B9", "T1", "T4", "T7", "T9"],
    ],
    humanJustDrawnTile: "T9",
  },
  [INITIAL_DEAL_PRESET.AN_GANG]: {
    hands: [
      [
        "W1",
        "W1",
        "W1",
        "W1",
        "W2",
        "W3",
        "W4",
        "W5",
        "W6",
        "W7",
        "B1",
        "B2",
        "B3",
        "T8",
      ],
      ["W2", "W2", "W3", "W4", "W5", "B4", "B5", "B6", "T1", "T2", "T3", "T4", "T5"],
      ["W6", "W7", "W8", "W9", "B1", "B2", "B3", "B4", "B5", "T6", "T7", "T8", "T9"],
      ["W3", "W4", "W5", "W6", "B6", "B7", "B8", "B9", "T1", "T1", "T2", "T2", "T3"],
    ],
    humanJustDrawnTile: "T8",
  },
  [INITIAL_DEAL_PRESET.SELF_HU_AN_GANG]: {
    hands: [
      [
        "W1",
        "W1",
        "W1",
        "W1",
        "W2",
        "W2",
        "W3",
        "W3",
        "W4",
        "W4",
        "W5",
        "W5",
        "W6",
        "W6",
      ],
      ["T1", "T1", "T2", "T2", "T3", "T3", "B1", "B1", "B2", "B2", "B3", "B3", "W7"],
      ["T4", "T4", "T5", "T5", "T6", "T6", "B4", "B4", "B5", "B5", "B6", "B6", "W8"],
      ["T7", "T7", "T8", "T8", "T9", "T9", "B7", "B7", "B8", "B8", "B9", "B9", "W9"],
    ],
    humanJustDrawnTile: "W6",
  },
  [INITIAL_DEAL_PRESET.DEALER_TENPAI]: {
    hands: [
      [
        "W1",
        "W1",
        "W1",
        "W2",
        "W2",
        "W2",
        "W3",
        "W3",
        "W3",
        "W4",
        "W5",
        "W6",
        "B8",
        "B9",
      ],
      ["W1", "W4", "W4", "W5", "W5", "W6", "W6", "B1", "B2", "B3", "T1", "T2", "T3"],
      ["W2", "W7", "W7", "W8", "W8", "W9", "W9", "B4", "B5", "B6", "T4", "T5", "T6"],
      ["W3", "T7", "T7", "T8", "T8", "T9", "T9", "B1", "B2", "B4", "B5", "B6", "B7"],
    ],
    humanJustDrawnTile: "B9",
  },
  [INITIAL_DEAL_PRESET.AI_MING_GANG]: {
    hands: [
      [
        "W5",
        "W1",
        "W2",
        "W3",
        "B1",
        "B2",
        "B3",
        "T1",
        "T2",
        "T3",
        "W7",
        "W8",
        "B9",
        "T9",
      ],
      ["W5", "W5", "W5", "W4", "W6", "B4", "B5", "B6", "T4", "T5", "T6", "W9", "B9"],
      ["W1", "W1", "W2", "W2", "W3", "W3", "B7", "B8", "B9", "T7", "T8", "T9", "W9"],
      ["T1", "T1", "T2", "T2", "T3", "T3", "B1", "B4", "B7", "W4", "W6", "W8", "B2"],
    ],
    humanJustDrawnTile: "T9",
  },
  [INITIAL_DEAL_PRESET.HUMAN_MULTI_CLAIM]: {
    hands: [
      [
        "W1",
        "W1",
        "W2",
        "W2",
        "W9",
        "W9",
        "W9",
        "T1",
        "T1",
        "T2",
        "T2",
        "B1",
        "B1",
        "B9",
      ],
      ["W1", "W2", "W4", "W5", "W8", "W8", "W9", "T1", "T2", "T3", "B1", "B2", "B3"],
      ["W3", "W4", "W5", "W6", "W7", "W8", "T4", "T5", "T6", "T9", "B4", "B5", "B6"],
      ["W3", "W4", "W6", "W7", "W8", "T3", "T4", "T6", "T7", "B2", "B3", "B5", "B7"],
    ],
    humanJustDrawnTile: "B9",
    wallDrawSequence: ["W3"],
  },
};
