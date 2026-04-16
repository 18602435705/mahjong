import { create } from "zustand";
import {
  createInitialGameState,
  gameReducer,
  GAME_ACTION,
  INITIAL_DEAL_PRESET,
  type GameAction,
  type GameState,
  type InitialDealPresetId,
} from "../mahjongEngine";

export type SelectedDiscard = {
  key: string;
  handSignature: string;
};

type GameStoreState = {
  game: GameState;
  selectedPresetId: InitialDealPresetId;
  selectedDiscard: SelectedDiscard | null;
  dispatch: (action: GameAction) => void;
  selectPreset: (presetId: InitialDealPresetId) => void;
  nextRound: () => void;
  resetGame: () => void;
  setSelectedDiscard: (selectedDiscard: SelectedDiscard | null) => void;
};

/**
 * 全局对局状态仓库：持有游戏状态、牌局预设与交互层选择态。
 */
export const useGameStore = create<GameStoreState>((set) => ({
  game: createInitialGameState(INITIAL_DEAL_PRESET.RANDOM),
  selectedPresetId: INITIAL_DEAL_PRESET.RANDOM,
  selectedDiscard: null,
  dispatch: (action) =>
    set((state) => ({
      game: gameReducer(state.game, action),
      selectedDiscard: null,
    })),
  selectPreset: (presetId) =>
    set((state) => ({
      selectedPresetId: presetId,
      game: gameReducer(state.game, {
        type: GAME_ACTION.RESET_GAME,
        presetId,
      }),
      selectedDiscard: null,
    })),
  nextRound: () =>
    set((state) => ({
      game: gameReducer(state.game, {
        type: GAME_ACTION.NEXT_ROUND,
        presetId: state.selectedPresetId,
      }),
      selectedDiscard: null,
    })),
  resetGame: () =>
    set((state) => ({
      game: gameReducer(state.game, {
        type: GAME_ACTION.RESET_GAME,
        presetId: state.selectedPresetId,
      }),
      selectedDiscard: null,
    })),
  setSelectedDiscard: (selectedDiscard) => set({ selectedDiscard }),
}));
