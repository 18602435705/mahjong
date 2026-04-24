import { create } from "zustand";
import {
  createInitialGameState,
  GAME_ACTION,
  type GameAction,
  type GameState,
} from "../mahjongEngine";
import type { RoomSeatView, RoomSnapshot, RoomStatus } from "../types/room";

export type SelectedDiscard = {
  key: string;
  index: number;
  handSignature: string;
};

type RemoteDispatch = (action: GameAction) => void;

type GameStoreState = {
  roomCode: string | null;
  roomStatus: RoomStatus | null;
  roomVersion: number;
  roomCanStart: boolean;
  roomOwnerUserId: number | null;
  roomSeats: RoomSeatView[];
  remoteDispatch: RemoteDispatch | null;
  game: GameState;
  selectedDiscard: SelectedDiscard | null;
  dispatch: (action: GameAction) => void;
  nextRound: () => void;
  resetGame: () => void;
  setSelectedDiscard: (selectedDiscard: SelectedDiscard | null) => void;
  setRemoteDispatch: (dispatch: RemoteDispatch | null) => void;
  setRoomSnapshot: (snapshot: RoomSnapshot) => void;
  clearRoomSession: () => void;
};

function createDefaultGameState() {
  return createInitialGameState();
}

/**
 * 全局对局状态仓库：只承载联机房间会话态与交互层选择态。
 */
export const useGameStore = create<GameStoreState>((set, get) => ({
  roomCode: null,
  roomStatus: null,
  roomVersion: 0,
  roomCanStart: false,
  roomOwnerUserId: null,
  roomSeats: [],
  remoteDispatch: null,
  game: createDefaultGameState(),
  selectedDiscard: null,
  dispatch: (action) => {
    const remoteDispatch = get().remoteDispatch;
    set({ selectedDiscard: null });

    if (!remoteDispatch) {
      return;
    }

    remoteDispatch(action);
  },
  nextRound: () => {
    get().dispatch({ type: GAME_ACTION.NEXT_ROUND });
  },
  resetGame: () => {
    get().dispatch({ type: GAME_ACTION.RESET_GAME });
  },
  setSelectedDiscard: (selectedDiscard) => set({ selectedDiscard }),
  setRemoteDispatch: (dispatch) => set({ remoteDispatch: dispatch }),
  setRoomSnapshot: (snapshot) =>
    set(() => ({
      roomCode: snapshot.code,
      roomStatus: snapshot.status,
      roomVersion: snapshot.version,
      roomCanStart: snapshot.canStart,
      roomOwnerUserId: snapshot.ownerUserId,
      roomSeats: snapshot.seats,
      game: snapshot.game ?? createDefaultGameState(),
      selectedDiscard: null,
    })),
  clearRoomSession: () =>
    set(() => ({
      roomCode: null,
      roomStatus: null,
      roomVersion: 0,
      roomCanStart: false,
      roomOwnerUserId: null,
      roomSeats: [],
      remoteDispatch: null,
      game: createDefaultGameState(),
      selectedDiscard: null,
    })),
}));
