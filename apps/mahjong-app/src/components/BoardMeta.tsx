import "./BoardMeta.css";
import * as Popover from "@radix-ui/react-popover";
import { useNavigate } from "react-router-dom";
import { leaveRoomApi } from "../api/rooms";
import { selectStatusText } from "../store/gameSelectors";
import { useGameStore } from "../store/gameStore";

/**
 * 渲染顶部元信息区域：菜单、局数与状态文案。
 */
function BoardMeta() {
  const navigate = useNavigate();
  const round = useGameStore((store) => store.game.round);
  const roomCode = useGameStore((store) => store.roomCode);
  const roomStatus = useGameStore((store) => store.roomStatus);
  const statusText = useGameStore((store) => {
    if (store.roomStatus === "lobby") {
      return "房间中：等待全部玩家准备并开局";
    }
    return selectStatusText(store.game);
  });
  const nextRound = useGameStore((store) => store.nextRound);
  const resetGame = useGameStore((store) => store.resetGame);
  const clearRoomSession = useGameStore((store) => store.clearRoomSession);

  async function handleBackLobby() {
    if (roomCode) {
      try {
        await leaveRoomApi(roomCode);
      } catch {
        // noop
      } finally {
        clearRoomSession();
      }
    }
    navigate("/lobby");
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
            <Popover.Content className="menu-panel" sideOffset={8} align="start">
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-nav"
                  onClick={() => void handleBackLobby()}
                >
                  返回大厅
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-main"
                  onClick={nextRound}
                  disabled={roomStatus === "lobby"}
                >
                  再来一局
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-sub"
                  onClick={resetGame}
                  disabled={roomStatus === "lobby"}
                >
                  重置积分
                </button>
              </Popover.Close>
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
