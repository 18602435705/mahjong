import {
  createInitialGameState,
  gameReducer,
  GAME_ACTION,
  INITIAL_DEAL_PRESET,
  PHASE,
} from "../../../../packages/mahjong-core/dist/index.js";
import { customAlphabet } from "nanoid";

const ROOM_CODE_DIGITS = "0123456789";
const ROOM_CODE_LENGTH = 6;
const ROOM_MAX_PLAYERS = 4;
const createRoomCodeToken = customAlphabet(ROOM_CODE_DIGITS, ROOM_CODE_LENGTH);

const rooms = new Map();
const roomSubscribers = new Map();

/**
 * 房间服务统一错误类型，携带可直接映射到 HTTP 的状态码。
 */
export class RoomError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "RoomError";
    this.status = status;
  }
}

/**
 * 刷新房间的最近更新时间戳。
 */
function touchRoom(room) {
  room.updatedAt = new Date().toISOString();
}

/**
 * 生成不与现有房间冲突的 6 位数字房间号。
 */
function generateRoomCode() {
  for (let attempts = 0; attempts < 32; attempts += 1) {
    const code = createRoomCodeToken();

    if (!rooms.has(code)) {
      return code;
    }
  }

  throw new RoomError(503, "Unable to allocate room code, please retry");
}

/**
 * 查找指定用户在房间中的座位下标，不存在时返回 -1。
 */
function findSeatIndex(room, userId) {
  return room.seats.findIndex((seat) => seat?.userId === userId);
}

/**
 * 根据房间号获取房间对象；不存在时抛出 404。
 */
function getRoomOrThrow(roomCode) {
  const room = rooms.get(roomCode);

  if (!room) {
    throw new RoomError(404, "Room not found");
  }

  return room;
}

/**
 * 校验用户是否在房间内，并返回其座位下标。
 */
function requireMembership(room, userId) {
  const seatIndex = findSeatIndex(room, userId);
  if (seatIndex < 0) {
    throw new RoomError(403, "You are not in this room");
  }

  return seatIndex;
}

/**
 * 获取房间对应的实时订阅集合，不存在则创建。
 */
function getOrCreateSubscriberBucket(roomCode) {
  let bucket = roomSubscribers.get(roomCode);
  if (!bucket) {
    bucket = new Set();
    roomSubscribers.set(roomCode, bucket);
  }
  return bucket;
}

/**
 * 从房间实时订阅集合中移除指定连接。
 */
function removeSubscriber(roomCode, subscription) {
  const bucket = roomSubscribers.get(roomCode);
  if (!bucket) {
    return;
  }

  bucket.delete(subscription);
  if (bucket.size === 0) {
    roomSubscribers.delete(roomCode);
  }
}

/**
 * 关闭房间所有实时订阅并清理集合。
 */
function closeSubscribers(roomCode) {
  const bucket = roomSubscribers.get(roomCode);
  if (!bucket) {
    return;
  }

  for (const subscription of bucket) {
    try {
      subscription.close?.();
    } catch {
      // noop
    }
  }

  roomSubscribers.delete(roomCode);
}

/**
 * 移除指定用户在房间中的全部实时订阅。
 */
function removeUserSubscribers(roomCode, userId) {
  const bucket = roomSubscribers.get(roomCode);
  if (!bucket) {
    return;
  }

  for (const subscription of [...bucket]) {
    if (subscription.userId !== userId) {
      continue;
    }

    bucket.delete(subscription);
    try {
      subscription.close?.();
    } catch {
      // noop
    }
  }

  if (bucket.size === 0) {
    roomSubscribers.delete(roomCode);
  }
}

/**
 * 查找用户当前所在房间，不存在则返回 null。
 */
function findExistingRoomByUser(userId) {
  for (const room of rooms.values()) {
    if (findSeatIndex(room, userId) >= 0) {
      return room;
    }
  }
  return null;
}

/**
 * 校验用户是否允许进入目标房间（同一时间仅允许在一个房间内）。
 */
function assertUserCanEnterRoom(userId, targetRoomCode = null) {
  const existingRoom = findExistingRoomByUser(userId);
  if (!existingRoom) {
    return;
  }

  if (targetRoomCode && existingRoom.code === targetRoomCode) {
    return;
  }

  throw new RoomError(
    409,
    `You are already in room ${existingRoom.code}, please leave it first`,
  );
}

/**
 * 为进入房间的用户创建座位结构。
 */
function createSeat(user) {
  return {
    userId: user.id,
    username: user.username,
    ready: false,
    joinedAt: new Date().toISOString(),
  };
}

/**
 * 将绝对座位下标转换为“以当前用户为 0 号位”的相对下标。
 */
function rotateIndex(absIndex, selfSeat) {
  return (absIndex - selfSeat + ROOM_MAX_PLAYERS) % ROOM_MAX_PLAYERS;
}

/**
 * 生成相对视角下的玩家展示名（自己固定显示为“你”）。
 */
function toLocalPlayerName(username, localIndex) {
  if (localIndex === 0) {
    return "你";
  }

  return username;
}

/**
 * 在非结束阶段隐藏他家手牌内容，仅保留张数。
 */
function withHiddenHand(player) {
  const hiddenTiles = Array.from({ length: player.hand.length }, () => "W1");
  return {
    ...player,
    hand: hiddenTiles,
    justDrawnTile: null,
    justDrawnFromGang: false,
  };
}

/**
 * 将服务端绝对对局状态转换为当前用户可见的相对视角状态。
 */
function rotateAndMaskGameState(gameState, selfSeat) {
  const rotatedPlayers = Array.from({ length: ROOM_MAX_PLAYERS }, (_, localIndex) => {
    const absIndex = (selfSeat + localIndex) % ROOM_MAX_PLAYERS;
    const basePlayer = gameState.players[absIndex];

    const mappedPlayer = {
      ...basePlayer,
      name: toLocalPlayerName(basePlayer.name, localIndex),
      isHuman: localIndex === 0,
    };

    if (gameState.phase === PHASE.GAME_OVER || localIndex === 0) {
      return mappedPlayer;
    }

    return withHiddenHand(mappedPlayer);
  });

  const isGameOver = gameState.phase === PHASE.GAME_OVER;
  const maskedWall = isGameOver
    ? [...gameState.wall]
    : Array.from({ length: gameState.wall.length }, () => "W1");

  return {
    ...gameState,
    players: rotatedPlayers,
    wall: maskedWall,
    currentPlayer: rotateIndex(gameState.currentPlayer, selfSeat),
    pendingClaims: gameState.pendingClaims.map((claim) => ({
      ...claim,
      player: rotateIndex(claim.player, selfSeat),
      from: rotateIndex(claim.from, selfSeat),
    })),
    qiangGang: gameState.qiangGang
      ? {
          ...gameState.qiangGang,
          actor: rotateIndex(gameState.qiangGang.actor, selfSeat),
          candidates: gameState.qiangGang.candidates.map((candidate) =>
            rotateIndex(candidate, selfSeat),
          ),
        }
      : null,
    lastDiscard: gameState.lastDiscard
      ? {
          ...gameState.lastDiscard,
          from: rotateIndex(gameState.lastDiscard.from, selfSeat),
        }
      : null,
    winner:
      typeof gameState.winner === "number"
        ? rotateIndex(gameState.winner, selfSeat)
        : null,
    winInfo: gameState.winInfo
      ? {
          ...gameState.winInfo,
          winner: rotateIndex(gameState.winInfo.winner, selfSeat),
          from:
            typeof gameState.winInfo.from === "number"
              ? rotateIndex(gameState.winInfo.from, selfSeat)
              : undefined,
        }
      : null,
  };
}

/**
 * 生成单个座位的前端展示结构。
 */
function toSeatView(seat, index, userId) {
  if (!seat) {
    return {
      index,
      userId: null,
      username: null,
      ready: false,
      isSelf: false,
    };
  }

  return {
    index,
    userId: seat.userId,
    username: seat.username,
    ready: seat.ready,
    isSelf: seat.userId === userId,
  };
}

/**
 * 构建房间快照视图（含座位、可开局状态与视角化牌局）。
 */
function buildRoomView(room, userId) {
  const selfSeat = requireMembership(room, userId);

  return {
    code: room.code,
    status: room.status,
    ownerUserId: room.ownerUserId,
    meSeat: selfSeat,
    version: room.version,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    canStart:
      room.status === "lobby" &&
      room.ownerUserId === userId &&
      room.seats.every((seat) => seat !== null) &&
      room.seats.every((seat) => seat?.ready === true),
    seats: room.seats.map((seat, index) => toSeatView(seat, index, userId)),
    game:
      room.gameState && room.status === "playing"
        ? rotateAndMaskGameState(room.gameState, selfSeat)
        : null,
  };
}

/**
 * 向房间内全部在线订阅者广播最新房间快照。
 */
function publishRoomUpdate(room) {
  const bucket = roomSubscribers.get(room.code);
  if (!bucket || bucket.size === 0) {
    return;
  }

  for (const subscription of bucket) {
    try {
      const view = buildRoomView(room, subscription.userId);
      subscription.send("room.update", {
        status: "ok",
        room: view,
      });
    } catch {
      removeSubscriber(room.code, subscription);
      try {
        subscription.close?.();
      } catch {
        // noop
      }
    }
  }
}

/**
 * 将客户端动作映射为核心引擎动作，并做基础权限校验。
 */
function mapClientActionToCoreAction(action, actor, ownerUserId, userId) {
  if (!action || typeof action !== "object") {
    throw new RoomError(400, "Invalid action payload");
  }

  const actionType = action.type;

  switch (actionType) {
    case GAME_ACTION.PLAYER_DISCARD:
      return {
        type: GAME_ACTION.PLAYER_DISCARD,
        actor,
        tile: action.tile,
      };

    case GAME_ACTION.PLAYER_SELF_HU:
      return {
        type: GAME_ACTION.PLAYER_SELF_HU,
        actor,
      };

    case GAME_ACTION.PLAYER_GANG:
      return {
        type: GAME_ACTION.PLAYER_GANG,
        actor,
        gangType: action.gangType,
        tile: action.tile,
      };

    case GAME_ACTION.PLAYER_CLAIM_DECISION:
      return {
        type: GAME_ACTION.PLAYER_CLAIM_DECISION,
        actor,
        accept: Boolean(action.accept),
        claimAction: action.claimAction,
      };

    case GAME_ACTION.PLAYER_QIANG_GANG_DECISION:
      return {
        type: GAME_ACTION.PLAYER_QIANG_GANG_DECISION,
        actor,
        accept: Boolean(action.accept),
      };

    case GAME_ACTION.NEXT_ROUND:
    case GAME_ACTION.RESET_GAME:
      if (ownerUserId !== userId) {
        throw new RoomError(403, "Only room owner can manage rounds");
      }
      return {
        type: actionType,
        presetId: INITIAL_DEAL_PRESET.RANDOM,
      };

    default:
      throw new RoomError(400, `Unsupported action type: ${String(actionType)}`);
  }
}

/**
 * 创建新房间并让发起人占据 0 号位。
 */
export function createRoom(user) {
  assertUserCanEnterRoom(user.id);

  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    status: "lobby",
    ownerUserId: user.id,
    seats: [createSeat(user), null, null, null],
    gameState: null,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  rooms.set(roomCode, room);
  return buildRoomView(room, user.id);
}

/**
 * 让用户加入目标房间；若已在该房间则返回当前快照。
 */
export function joinRoom(user, roomCode) {
  if (!roomCode) {
    throw new RoomError(400, "Room code is required");
  }

  assertUserCanEnterRoom(user.id, roomCode);

  const room = getRoomOrThrow(roomCode);
  const existingSeat = findSeatIndex(room, user.id);
  if (existingSeat >= 0) {
    return buildRoomView(room, user.id);
  }

  if (room.status !== "lobby") {
    throw new RoomError(409, "Game has already started");
  }

  const availableSeat = room.seats.findIndex((seat) => seat === null);
  if (availableSeat < 0) {
    throw new RoomError(409, "Room is full");
  }

  room.seats[availableSeat] = createSeat(user);
  room.version += 1;
  touchRoom(room);
  publishRoomUpdate(room);

  return buildRoomView(room, user.id);
}

/**
 * 用户离开房间；若房间无人则自动销毁房间。
 */
export function leaveRoom(userId, roomCode) {
  const room = getRoomOrThrow(roomCode);
  const seatIndex = requireMembership(room, userId);

  if (room.status === "playing") {
    throw new RoomError(409, "Cannot leave while game is in progress");
  }

  room.seats[seatIndex] = null;

  if (room.ownerUserId === userId) {
    const nextOwnerSeat = room.seats.find((seat) => seat !== null);
    room.ownerUserId = nextOwnerSeat?.userId ?? null;
  }

  room.version += 1;
  touchRoom(room);
  removeUserSubscribers(room.code, userId);

  const hasPlayers = room.seats.some((seat) => seat !== null);
  if (!hasPlayers) {
    rooms.delete(room.code);
    closeSubscribers(room.code);
    return;
  }

  publishRoomUpdate(room);
}

/**
 * 修改用户在房间大厅中的准备状态。
 */
export function setReadyState(userId, roomCode, ready) {
  const room = getRoomOrThrow(roomCode);
  const seatIndex = requireMembership(room, userId);

  if (room.status !== "lobby") {
    throw new RoomError(409, "Ready state can only be changed in lobby");
  }

  room.seats[seatIndex].ready = Boolean(ready);
  room.version += 1;
  touchRoom(room);
  publishRoomUpdate(room);

  return buildRoomView(room, userId);
}

/**
 * 由房主发起开局，初始化对局并广播房间状态。
 */
export function startGame(userId, roomCode) {
  const room = getRoomOrThrow(roomCode);
  requireMembership(room, userId);

  if (room.ownerUserId !== userId) {
    throw new RoomError(403, "Only room owner can start game");
  }

  if (room.status !== "lobby") {
    throw new RoomError(409, "Game already started");
  }

  const allSeatsFilled = room.seats.every((seat) => seat !== null);
  if (!allSeatsFilled) {
    throw new RoomError(409, "Need 4 players to start");
  }

  const allReady = room.seats.every((seat) => seat?.ready === true);
  if (!allReady) {
    throw new RoomError(409, "All players must be ready");
  }

  const state = createInitialGameState(INITIAL_DEAL_PRESET.RANDOM);

  room.seats.forEach((seat, index) => {
    state.players[index].name = seat.username;
    state.players[index].isHuman = true;
    seat.ready = false;
  });

  room.status = "playing";
  room.gameState = state;
  room.version += 1;
  touchRoom(room);
  publishRoomUpdate(room);

  return buildRoomView(room, userId);
}

/**
 * 在进行中的房间对局里应用一个用户动作并广播更新。
 */
export function applyGameAction(userId, roomCode, action) {
  const room = getRoomOrThrow(roomCode);
  const seatIndex = requireMembership(room, userId);

  if (room.status !== "playing" || !room.gameState) {
    throw new RoomError(409, "Game is not active");
  }

  const coreAction = mapClientActionToCoreAction(
    action,
    seatIndex,
    room.ownerUserId,
    userId,
  );

  const prevState = room.gameState;
  const nextState = gameReducer(prevState, coreAction);
  if (nextState === prevState) {
    throw new RoomError(400, "Action is invalid for current state");
  }

  room.gameState = nextState;
  room.version += 1;
  touchRoom(room);
  publishRoomUpdate(room);

  return buildRoomView(room, userId);
}

/**
 * 获取用户在目标房间下的可见快照。
 */
export function getRoomView(userId, roomCode) {
  const room = getRoomOrThrow(roomCode);
  return buildRoomView(room, userId);
}

/**
 * 建立房间实时订阅并推送首帧连接/快照事件，返回清理函数。
 */
export function subscribeRoom(userId, roomCode, subscriber) {
  const room = getRoomOrThrow(roomCode);
  requireMembership(room, userId);

  const subscription = {
    userId,
    send: subscriber.send,
    close: subscriber.close,
  };
  getOrCreateSubscriberBucket(room.code).add(subscription);

  const cleanup = () => {
    removeSubscriber(room.code, subscription);
  };

  subscription.send("room.connected", {
    status: "ok",
    roomCode: room.code,
  });

  const currentView = buildRoomView(room, userId);
  subscription.send("room.update", {
    status: "ok",
    room: currentView,
  });

  return cleanup;
}
