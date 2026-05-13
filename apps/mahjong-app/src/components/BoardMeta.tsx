import "./BoardMeta.css";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isVoiceEnabled, setVoiceEnabled } from "../actionAudio";
import { selectStatusText } from "../store/gameSelectors";
import { useGameStore } from "../store/gameStore";

type BoardMetaProps = {
  leaveRoom: () => Promise<void>;
  endMatch: () => Promise<void>;
  isOwner: boolean;
  canShowEndMatch: boolean;
};

/**
 * 渲染顶部元信息区域：菜单、局数与状态文案。
 */
function BoardMeta({
  leaveRoom,
  endMatch,
  isOwner,
  canShowEndMatch,
}: BoardMetaProps) {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabledState] = useState(() => isVoiceEnabled());
  const [isEndingMatch, setIsEndingMatch] = useState(false);
  const round = useGameStore((store) => store.game.round);
  const roomCode = useGameStore((store) => store.roomCode);
  const statusText = useGameStore((store) => {
    if (store.roomStatus === "lobby") {
      return "房间中：等待玩家到齐后由房主开局";
    }
    return selectStatusText(store.game);
  });
  const clearRoomSession = useGameStore((store) => store.clearRoomSession);

  async function handleBackLobby() {
    if (roomCode) {
      try {
        await leaveRoom();
      } catch {
        // noop
      } finally {
        clearRoomSession();
      }
    }
    navigate("/lobby");
  }

  function handleToggleVoice() {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    setVoiceEnabledState(next);
  }

  async function handleEndMatch() {
    if (!isOwner || !roomCode || isEndingMatch) {
      return;
    }

    const shouldProceed = window.confirm("确认结束对局并进入结算页吗？");
    if (!shouldProceed) {
      return;
    }

    setIsEndingMatch(true);
    try {
      await endMatch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "结束对局失败";
      window.alert(message);
      setIsEndingMatch(false);
    }
  }

  return (
    <section className="board-meta">
      <div className="fab-menu">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className="menu-trigger" aria-label="菜单">
              ☰
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="menu-panel"
              sideOffset={8}
              align="start"
            >
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-nav"
                  onClick={() => void handleBackLobby()}
                >
                  返回大厅
                </button>
              </Popover.Close>
              <button
                type="button"
                className="menu-item btn-sub"
                onClick={handleToggleVoice}
              >
                {voiceEnabled ? "声音：开" : "声音：关"}
              </button>
              {isOwner && canShowEndMatch ? (
                <Popover.Close asChild>
                  <button
                    type="button"
                    className="menu-item btn-danger"
                    disabled={isEndingMatch}
                    onClick={() => void handleEndMatch()}
                  >
                    {isEndingMatch ? "结束中..." : "结束对局"}
                  </button>
                </Popover.Close>
              ) : null}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="meta-chip">第 {round} 局</div>
      <div className="meta-status" aria-live="polite">
        {statusText}
      </div>
      {roomCode ? <div className="meta-chip">房间 {roomCode}</div> : null}
    </section>
  );
}

export default BoardMeta;
