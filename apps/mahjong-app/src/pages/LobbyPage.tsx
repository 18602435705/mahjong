import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { activateVoicePlayback } from "../actionAudio";
import { joinRoomApi, createRoomApi } from "../api/rooms";
import { useAuth } from "../auth/useAuth";
import {
  INITIAL_DEAL_PRESET,
  INITIAL_DEAL_PRESET_OPTIONS,
  type InitialDealPresetId,
} from "../mahjongEngine";
import "./LobbyPage.css";

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<InitialDealPresetId>(
    INITIAL_DEAL_PRESET.RANDOM,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const displayName = useMemo(() => user?.username ?? "游客", [user?.username]);

  async function handleCreateRoom() {
    setIsBusy(true);
    setFeedback("正在创建房间...");

    try {
      const response = await createRoomApi(selectedPresetId);
      const roomCode = response.room.code;
      activateVoicePlayback();
      setFeedback(`房间 ${roomCode} 创建成功，正在进入...`);
      navigate(`/game?room=${encodeURIComponent(roomCode)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建房间失败";
      setFeedback(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoinByCode() {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setFeedback("请输入房间号再加入");
      return;
    }

    setIsBusy(true);
    setFeedback(`正在加入房间 ${normalizedCode}...`);

    try {
      const response = await joinRoomApi(normalizedCode);
      const roomCode = response.room.code;
      activateVoicePlayback();
      navigate(`/game?room=${encodeURIComponent(roomCode)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加入房间失败";
      setFeedback(message);
    } finally {
      setIsBusy(false);
    }
  }

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>) {
    const presetId = event.target.value as InitialDealPresetId;
    setSelectedPresetId(presetId);
  }

  function handleLogout() {
    signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="lobby-page">
      <header className="lobby-header">
        <div>
          <p className="lobby-kicker">Mahjong Lobby</p>
          <h1>欢迎回来，{displayName}</h1>
          <p>创建新房间或输入房间号，快速进入对局。</p>
        </div>
        <button className="ghost-btn" type="button" onClick={handleLogout}>
          退出登录
        </button>
      </header>

      <main className="lobby-main">
        <section className="lobby-panel action-panel">
          <div className="panel-head">
            <h2>快速操作</h2>
            <span>联机模式</span>
          </div>

          <label className="preset-field">
            <span>选择预设（默认随机发牌）</span>
            <select
              value={selectedPresetId}
              disabled={isBusy}
              onChange={handlePresetChange}
            >
              {INITIAL_DEAL_PRESET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="primary-action"
            type="button"
            disabled={isBusy}
            onClick={() => void handleCreateRoom()}
          >
            {isBusy ? "处理中..." : "创建房间"}
          </button>

          <label className="join-field">
            <span>房间号加入</span>
            <div>
              <input
                value={joinCode}
                onChange={(event) => {
                  setFeedback("");
                  setJoinCode(event.target.value);
                }}
                placeholder="例如 123456"
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleJoinByCode()}
              >
                加入
              </button>
            </div>
          </label>

          <button
            className="secondary-action"
            type="button"
            disabled={isBusy}
            onClick={() => navigate("/history")}
          >
            历史对局
          </button>

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </section>
      </main>
    </div>
  );
}
