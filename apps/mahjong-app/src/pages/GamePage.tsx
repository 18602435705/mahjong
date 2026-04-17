import { useEffect } from "react";
import { installAudioUnlock } from "../actionAudio";
import BoardMeta from "../components/BoardMeta";
import DiscardPool from "../components/DiscardPool";
import HumanActionPanel from "../components/HumanActionPanel";
import PlayerSeat from "../components/PlayerSeat";
import { useAiStep } from "../hooks/useAiStep";
import { useActionVoice } from "../hooks/useActionVoice";
import "../App.css";

/**
 * 麻将对局主界面容器，负责页面布局与副作用挂载。
 */
export default function GamePage() {
  useEffect(() => {
    installAudioUnlock();
  }, []);

  useAiStep();
  useActionVoice();

  return (
    <div className="mahjong-app">
      <BoardMeta />

      <main className="table-grid">
        <PlayerSeat playerIndex={2} showHand={false} seatClass="seat-top" />
        <PlayerSeat playerIndex={3} showHand={false} seatClass="seat-left" />

        <section className="center-panel">
          <DiscardPool />
        </section>

        <PlayerSeat playerIndex={1} showHand={false} seatClass="seat-right" />

        <PlayerSeat playerIndex={0} showHand seatClass="seat-bottom" />
      </main>

      <HumanActionPanel />
    </div>
  );
}
