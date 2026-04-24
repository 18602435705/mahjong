import { memo, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import BoardMeta from "../components/BoardMeta";
import DiscardPool from "../components/DiscardPool";
import PlayerSeat from "../components/PlayerSeat";
import { leaveRoomApi, setReadyApi, startRoomApi } from "../api/rooms";
import { useActionVoice } from "../hooks/useActionVoice";
import { useRoomSession } from "../hooks/useRoomSession";
import { useGameStore } from "../store/gameStore";
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

function RoomLobbyPanel({ roomCode }: { roomCode: string }) {
  const navigate = useNavigate();
  const roomSeats = useGameStore((store) => store.roomSeats);
  const roomCanStart = useGameStore((store) => store.roomCanStart);
  const setRoomSnapshot = useGameStore((store) => store.setRoomSnapshot);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const selfSeat = useMemo(
    () => roomSeats.find((seat) => seat.isSelf),
    [roomSeats],
  );
  const isSelfReady = selfSeat?.ready ?? false;

  async function handleToggleReady() {
    setIsBusy(true);
    setFeedback(isSelfReady ? "取消准备中..." : "准备中...");

    try {
      const response = await setReadyApi(roomCode, !isSelfReady);
      setRoomSnapshot(response.room);
      setFeedback(isSelfReady ? "已取消准备" : "已准备，等待其他玩家");
    } catch (error) {
      const message = error instanceof Error ? error.message : "设置准备状态失败";
      setFeedback(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleStartGame() {
    setIsBusy(true);
    setFeedback("正在开局...");

    try {
      const response = await startRoomApi(roomCode);
      setRoomSnapshot(response.room);
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
      await leaveRoomApi(roomCode);
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
      <p>等待全部玩家准备后由房主开局。</p>

      <ul className="room-seat-list">
        {roomSeats.map((seat) => (
          <li key={`seat-${seat.index}`}>
            {`座位 ${seat.index + 1} · ${seat.username ?? "空位"}`}
            {seat.isSelf ? "（你）" : ""}
            {seat.username ? (seat.ready ? " · 已准备" : " · 未准备") : ""}
          </li>
        ))}
      </ul>

      <div className="room-lobby-actions">
        <button type="button" disabled={isBusy} onClick={() => void handleToggleReady()}>
          {isSelfReady ? "取消准备" : "准备"}
        </button>
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

/**
 * 麻将对局主界面容器，房间模式唯一入口。
 */
function GamePage() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("room")?.trim().toUpperCase() ?? null;

  const roomStatus = useGameStore((store) => store.roomStatus);
  const { isConnecting, connectionError } = useRoomSession(roomCode);

  if (!roomCode) {
    return <Navigate to="/lobby" replace />;
  }

  const showLoading = roomStatus === null && isConnecting;
  const showRoomLobby = roomStatus === "lobby";
  const showTable = roomStatus === "playing";

  return (
    <div className="mahjong-app">
      <GameEffects />
      <BoardMeta />

      {showLoading ? (
        <section className="room-lobby-panel">
          <h2>连接房间中...</h2>
          <p>{connectionError || "正在同步房间状态"}</p>
        </section>
      ) : null}

      {showRoomLobby ? <RoomLobbyPanel roomCode={roomCode} /> : null}

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

      {!showLoading && roomStatus === null ? (
        <section className="room-lobby-panel">
          <h2>进入房间失败</h2>
          <p>{connectionError || "请返回大厅后重试"}</p>
        </section>
      ) : null}

      {connectionError && !showLoading ? (
        <p className="room-connection-error">{connectionError}</p>
      ) : null}
    </div>
  );
}

export default memo(GamePage);
