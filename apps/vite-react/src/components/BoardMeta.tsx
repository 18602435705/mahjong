import "./BoardMeta.css";
import type { RefObject } from "react";

type BoardMetaProps = {
  menuRef: RefObject<HTMLDetailsElement | null>;
  menuOpen: boolean;
  round: number;
  statusText: string;
  onToggleMenu: () => void;
  onNextRound: () => void;
  onResetGame: () => void;
};

/**
 * 渲染顶部元信息区域：菜单、局数与状态文案。
 */
function BoardMeta(props: BoardMetaProps) {
  const {
    menuRef,
    menuOpen,
    round,
    statusText,
    onToggleMenu,
    onNextRound,
    onResetGame,
  } = props;

  return (
    <section className="board-meta">
      <details ref={menuRef} className="fab-menu" open={menuOpen}>
        <summary
          className="menu-trigger"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.preventDefault();
            onToggleMenu();
          }}
        >
          ☰
        </summary>
        <div className="menu-panel">
          <button type="button" className="menu-item btn-main" onClick={onNextRound}>
            再来一局
          </button>
          <button type="button" className="menu-item btn-sub" onClick={onResetGame}>
            重置积分
          </button>
        </div>
      </details>
      <div className="meta-chip">第 {round} 局</div>
      <div className="meta-status" aria-live="polite">
        {statusText}
      </div>
    </section>
  );
}

export default BoardMeta;
