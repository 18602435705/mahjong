import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { activateVoicePlayback } from "../actionAudio";
import { useAuth } from "../auth/useAuth";
import { applyPreferredOrientation } from "../orientation/screenOrientation";
import "./LobbyPage.css";

function wait(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const displayName = useMemo(() => user?.username ?? "游客", [user?.username]);

  async function enterGame(message: string) {
    setFeedback(message);
    setIsBusy(true);
    activateVoicePlayback();
    await applyPreferredOrientation("landscape", {
      allowFullscreen: true,
    });
    await wait(320);
    navigate("/game");
  }

  async function handleCreateRoom() {
    await enterGame("房间创建成功，正在进入牌桌...");
  }

  async function handleJoinByCode() {
    const normalizedCode = joinCode.trim();
    if (!normalizedCode) {
      setFeedback("请输入房间号再加入");
      return;
    }
    await enterGame(`正在加入房间 ${normalizedCode}...`);
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
            <span>本地模拟</span>
          </div>

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
                placeholder="例如 east-001"
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
            onClick={() => void enterGame("正在进入牌桌...")}
          >
            直接进入游戏
          </button>

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </section>
      </main>
    </div>
  );
}
