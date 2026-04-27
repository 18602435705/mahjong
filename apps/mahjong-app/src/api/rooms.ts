import { request } from "./client";
import type { RoomSnapshot } from "../types/room";

interface RoomResponse {
  status: "ok";
  room: RoomSnapshot;
}

export function createRoomApi() {
  return request<RoomResponse>({
    url: "/api/rooms/create",
    method: "POST",
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
