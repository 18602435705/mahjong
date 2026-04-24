import { API_BASE_URL, request } from "./client";
import type { GameAction } from "../mahjongEngine";
import type { RoomSnapshot } from "../types/room";

interface RoomResponse {
  status: "ok";
  room: RoomSnapshot;
}

interface RoomLeaveResponse {
  status: "ok";
  message: string;
}

export function createRoomApi() {
  return request<RoomResponse>({
    url: "/api/rooms",
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

export function getRoomApi(roomCode: string) {
  return request<RoomResponse>({
    url: `/api/rooms/${encodeURIComponent(roomCode)}`,
    method: "GET",
  });
}

export function setReadyApi(roomCode: string, ready: boolean) {
  return request<RoomResponse>({
    url: `/api/rooms/${encodeURIComponent(roomCode)}/ready`,
    method: "POST",
    data: {
      ready,
    },
  });
}

export function startRoomApi(roomCode: string) {
  return request<RoomResponse>({
    url: `/api/rooms/${encodeURIComponent(roomCode)}/start`,
    method: "POST",
  });
}

export function leaveRoomApi(roomCode: string) {
  return request<RoomLeaveResponse>({
    url: `/api/rooms/${encodeURIComponent(roomCode)}/leave`,
    method: "POST",
  });
}

export function postRoomActionApi(roomCode: string, action: GameAction) {
  return request<RoomResponse>({
    url: `/api/rooms/${encodeURIComponent(roomCode)}/actions`,
    method: "POST",
    data: {
      action,
    },
  });
}

export function getRoomEventsUrl(roomCode: string, token: string) {
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const encodedCode = encodeURIComponent(roomCode);
  const encodedToken = encodeURIComponent(token);
  return `${normalizedBase}/api/rooms/${encodedCode}/events?token=${encodedToken}`;
}
