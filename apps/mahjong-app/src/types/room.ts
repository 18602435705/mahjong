import type { GameState } from "../mahjongEngine";

export type RoomStatus = "lobby" | "playing";

export interface RoomSeatView {
  index: number;
  userId: number | null;
  username: string | null;
  ready: boolean;
  isSelf: boolean;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  ownerUserId: number | null;
  meSeat: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  canStart: boolean;
  seats: RoomSeatView[];
  game: GameState | null;
}
