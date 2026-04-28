import { request } from "./client";
import type { InitialDealPresetId } from "../mahjongEngine";
import type { RoomSnapshot } from "../types/room";

interface RoomResponse {
  status: "ok";
  room: RoomSnapshot;
}

export function createRoomApi(presetId?: InitialDealPresetId) {
  return request<RoomResponse>({
    url: "/api/rooms/create",
    method: "POST",
    data: presetId
      ? {
          presetId,
        }
      : undefined,
  });
}

export function joinRoomApi(roomCode: string) {
  return request<RoomResponse>({
    url: "/api/rooms/join",
    method: "POST",
    data: {
      roomCode,
    },
  });
}
