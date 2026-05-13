import { memo, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import BoardMeta from "../components/BoardMeta";
import DiscardPool from "../components/DiscardPool";
import PlayerSeat from "../components/PlayerSeat";
import { PHASE } from "../mahjongEngine";
import { useActionVoice } from "../hooks/useActionVoice";
import { useRoomSession } from "../hooks/useRoomSession";
import { persistMatchResult } from "../result/resultStorage";
import { useGameStore } from "../store/gameStore";
import type { RoomSeatView } from "../types/room";
import "../App.css";

const AI_SEATS = [
  { playerIndex: 2, showHand: false, seatClass: "seat-top" },
  { playerIndex: 3, showHand: false, seatClass: "seat-left" },
  { playerIndex: 1, showHand: false, seatClass: "seat-right" },
] as const;

/**
 * 对局副作用：动作播报。
 */
const GameEffects = memo(function GameEffects() {
  useActionVoice();
  return null;
});

type RoomLobbyPanelProps = {
  roomCode: string;
  sendStart: () => Promise<void>;
  sendLeave: () => Promise<void>;
};

function RoomLobbyPanel({
  roomCode,
  sendStart,
  sendLeave,
}: RoomLobbyPanelProps) {
  const navigate = useNavigate();
  const roomSeats = useGameStore((store) => store.roomSeats);
  const roomCanStart = useGameStore((store) => store.roomCanStart);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleStartGame() {
    setIsBusy(true);
    setFeedback("正在开局...");

    try {
      await sendStart();
      setFeedback("对局开始");
    } catch (error) {
      const message = error instanceof Error ? error.message : "开局失败";
      setFeedback(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLeaveRoom() {
    setIsBusy(true);
    setFeedback("正在离开房间...");

    try {
      await sendLeave();
      useGameStore.getState().clearRoomSession();
      navigate("/lobby", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "离开房间失败";
      setFeedback(message);
      setIsBusy(false);
    }
  }

  return (
    <section className="room-lobby-panel" aria-live="polite">
      <h2>房间 {roomCode}</h2>
      <p>玩家入座后默认已准备，等待玩家到齐后由房主开局。</p>

      <ul className="room-seat-list">
        {roomSeats.map((seat) => (
          <li key={`seat-${seat.index}`}>
            {`座位 ${seat.index + 1} · ${seat.username ?? "空位"}`}
            {seat.isSelf ? "（你）" : ""}
            {seat.username ? " · 已就绪" : ""}
          </li>
        ))}
      </ul>

      <div className="room-lobby-actions">
        <button
          type="button"
          disabled={isBusy || !roomCanStart}
          onClick={() => void handleStartGame()}
        >
          开始游戏
        </button>
        <button type="button" disabled={isBusy} onClick={() => void handleLeaveRoom()}>
          离开房间
        </button>
      </div>

      {feedback ? <p>{feedback}</p> : null}
    </section>
  );
}

type RoundSettlementModalProps = {
  roomCode: string;
  seats: RoomSeatView[];
  isOwner: boolean;
  sendRematchReady: () => Promise<void>;
  sendEndMatch: () => Promise<void>;
};

function RoundSettlementModal({
  roomCode,
  seats,
  isOwner,
  sendRematchReady,
  sendEndMatch,
}: RoundSettlementModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEndingMatch, setIsEndingMatch] = useState(false);
  const [feedback, setFeedback] = useState("");

  const selfSeat = useMemo(
    () => seats.find((seat) => seat.isSelf),
    [seats],
  );
  const isSelfConfirmed = selfSeat?.ready ?? false;

  const occupiedSeats = useMemo(
    () => seats.filter((seat) => seat.userId !== null),
    [seats],
  );
  const confirmedCount = useMemo(
    () => occupiedSeats.filter((seat) => seat.ready).length,
    [occupiedSeats],
  );

  async function handleConfirmRematch() {
    if (isSelfConfirmed || isConfirming || isEndingMatch) {
      return;
    }

    setIsConfirming(true);
    setFeedback("正在确认再来一局...");

    try {
      await sendRematchReady();
      setFeedback("你已确认，等待其他玩家...");
    } catch (error) {
      const message = error instanceof Error ? error.message : "确认再来一局失败";
      setFeedback(message);
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleEndMatch() {
    if (!isOwner || isEndingMatch || isConfirming) {
      return;
    }

    const shouldProceed = window.confirm("确认解散房间并进入结算页吗？");
    if (!shouldProceed) {
      return;
    }

    setIsEndingMatch(true);
    setFeedback("正在结束对局...");

    try {
      await sendEndMatch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "结束对局失败";
      setFeedback(message);
      setIsEndingMatch(false);
    }
  }

  return (
    <section className="round-settlement-overlay" aria-live="polite">
      <div className="round-settlement-dialog">
        <h2>本局已结束</h2>
        <p>{`房间 ${roomCode} · 已确认 ${confirmedCount}/${occupiedSeats.length}`}</p>

        <ul className="round-settlement-list">
          {occupiedSeats.map((seat) => (
            <li key={`settle-seat-${seat.index}`}>
              {`座位 ${seat.index + 1} · ${seat.username ?? "未知玩家"}`}
              {seat.isSelf ? "（你）" : ""}
              {seat.ready ? " · 已确认" : " · 待确认"}
            </li>
          ))}
        </ul>

        <div className="round-settlement-actions">
          <button
            type="button"
            disabled={isSelfConfirmed || isConfirming || isEndingMatch}
            onClick={() => void handleConfirmRematch()}
          >
            {isSelfConfirmed ? "已确认再来一局" : "再来一局"}
          </button>
          {isOwner ? (
            <button
              type="button"
              disabled={isEndingMatch || isConfirming}
              onClick={() => void handleEndMatch()}
            >
              结束对局
            </button>
          ) : null}
        </div>

        {feedback ? <p>{feedback}</p> : null}
      </div>
    </section>
  );
}

/**
 * 麻将对局主界面容器，房间模式唯一入口。
 */
function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("room")?.trim().toUpperCase() ?? null;

  const roomStatus = useGameStore((store) => store.roomStatus);
  const roomOwnerUserId = useGameStore((store) => store.roomOwnerUserId);
  const roomSeats = useGameStore((store) => store.roomSeats);
  const game = useGameStore((store) => store.game);
  const {
    isConnecting,
    connectionError,
    sendStart,
    sendLeave,
    sendRematchReady,
    sendEndMatch,
    matchResult,
  } = useRoomSession(roomCode);

  const selfSeat = useMemo(
    () => roomSeats.find((seat) => seat.isSelf),
    [roomSeats],
  );
  const isRoomOwner = Boolean(
    selfSeat?.userId !== null && selfSeat?.userId === roomOwnerUserId,
  );

  useEffect(() => {
    if (!matchResult) {
      return;
    }

    persistMatchResult(matchResult);
    useGameStore.getState().clearRoomSession();
    navigate("/result", {
      replace: true,
      state: {
        result: matchResult,
      },
    });
  }, [matchResult, navigate]);

  if (!roomCode) {
    return <Navigate to="/lobby" replace />;
  }

  const showLoading = roomStatus === null && isConnecting;
  const showRoomLobby = roomStatus === "lobby";
  const showTable = roomStatus === "playing";
  const showRoundSettlementModal =
    showTable && game.phase === PHASE.GAME_OVER;

  return (
    <div className="mahjong-app">
      <GameEffects />
      <BoardMeta leaveRoom={sendLeave} />

      {showLoading ? (
        <section className="room-lobby-panel">
          <h2>连接房间中...</h2>
          <p>{connectionError || "正在同步房间状态"}</p>
        </section>
      ) : null}

      {showRoomLobby ? (
        <RoomLobbyPanel
          roomCode={roomCode}
          sendStart={sendStart}
          sendLeave={sendLeave}
        />
      ) : null}

      {showTable ? (
        <main className="table-grid">
          {AI_SEATS.map((seat) => (
            <PlayerSeat
              key={seat.seatClass}
              playerIndex={seat.playerIndex}
              showHand={seat.showHand}
              seatClass={seat.seatClass}
            />
          ))}
          <section className="center-panel">
            <DiscardPool />
          </section>
          <PlayerSeat playerIndex={0} showHand seatClass="seat-bottom" />
        </main>
      ) : null}

      {showRoundSettlementModal ? (
        <RoundSettlementModal
          roomCode={roomCode}
          seats={roomSeats}
          isOwner={isRoomOwner}
          sendRematchReady={sendRematchReady}
          sendEndMatch={sendEndMatch}
        />
      ) : null}

      {!showLoading && roomStatus === null ? (
        <section className="room-lobby-panel">
          <h2>进入房间失败</h2>
          <p>{connectionError || "请返回大厅后重试"}</p>
          <div className="room-lobby-actions">
            <button
              type="button"
              onClick={() => {
                useGameStore.getState().clearRoomSession();
                navigate("/lobby", { replace: true });
              }}
            >
              返回大厅
            </button>
          </div>
        </section>
      ) : null}

      {connectionError && !showLoading ? (
        <p className="room-connection-error">{connectionError}</p>
      ) : null}
    </div>
  );
}

export default memo(GamePage);
