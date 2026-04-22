import { memo } from "react";
import BoardMeta from "../components/BoardMeta";
import DiscardPool from "../components/DiscardPool";
import PlayerSeat from "../components/PlayerSeat";
import { useAiStep } from "../hooks/useAiStep";
import { useActionVoice } from "../hooks/useActionVoice";
import "../App.css";

const AI_SEATS = [
  { playerIndex: 2, showHand: false, seatClass: "seat-top" },
  { playerIndex: 3, showHand: false, seatClass: "seat-left" },
  { playerIndex: 1, showHand: false, seatClass: "seat-right" },
] as const;

/**
 * 承载对局副作用：AI 调度与动作播报。
 * 单独拆分为组件，避免其状态订阅导致 GamePage 主容器反复重渲染。
 */
const GameEffects = memo(function GameEffects() {
  useAiStep();
  useActionVoice();
  return null;
});

/**
 * 麻将对局主界面容器，负责页面布局与副作用挂载。
 */
function GamePage() {
  return (
    <div className="mahjong-app">
      <GameEffects />
      <BoardMeta />
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
    </div>
  );
}

export default memo(GamePage);
