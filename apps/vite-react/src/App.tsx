import { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";
import { installAudioUnlock } from "./actionAudio";
import BoardMeta from "./components/BoardMeta";
import DiscardPool from "./components/DiscardPool";
import HumanActionPanel from "./components/HumanActionPanel";
import PlayerSeat from "./components/PlayerSeat";
import { useAiStep } from "./hooks/useAiStep";
import { useActionVoice } from "./hooks/useActionVoice";
import { useDismissibleMenu } from "./hooks/useDismissibleMenu";
import { useGameViewModel } from "./hooks/useGameViewModel";
import {
  createInitialGameState,
  GAME_ACTION,
  gameReducer,
} from "./mahjongEngine";

/**
 * 麻将对局主界面容器，负责状态编排、派发动作与拼装各业务子组件。
 */
function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );
  const menuRef = useRef<HTMLDetailsElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    statusText,
    humanOptions,
    currentClaim,
    qiangGangCandidate,
    humanSelfHuMethod,
    humanSelfHuSpecials,
    activeSelectedDiscardKey,
    handleHumanTileClick,
  } = useGameViewModel(state, dispatch);

  useEffect(() => {
    installAudioUnlock();
  }, []);

  useAiStep(state, currentClaim, qiangGangCandidate, dispatch);
  useActionVoice(state);
  useDismissibleMenu(menuOpen, menuRef, () => setMenuOpen(false));

  return (
    <div className="mahjong-app">
      <BoardMeta
        menuRef={menuRef}
        menuOpen={menuOpen}
        round={state.round}
        statusText={statusText}
        onToggleMenu={() => setMenuOpen((current) => !current)}
        onNextRound={() => {
          dispatch({ type: GAME_ACTION.NEXT_ROUND });
          setMenuOpen(false);
        }}
        onResetGame={() => {
          dispatch({ type: GAME_ACTION.RESET_GAME });
          setMenuOpen(false);
        }}
      />

      <main className="table-grid">
        <PlayerSeat
          title={state.players[2].name}
          playerIndex={2}
          state={state}
          showHand={false}
          seatClass="seat-top"
        />
        <PlayerSeat
          title={state.players[3].name}
          playerIndex={3}
          state={state}
          showHand={false}
          seatClass="seat-left"
        />

        <section className="center-panel">
          <DiscardPool state={state} wallCount={state.wall.length} />
        </section>

        <PlayerSeat
          title={state.players[1].name}
          playerIndex={1}
          state={state}
          showHand={false}
          seatClass="seat-right"
        />

        <PlayerSeat
          title={state.players[0].name}
          playerIndex={0}
          state={state}
          showHand
          seatClass="seat-bottom"
          onTileClick={handleHumanTileClick}
          canDiscard={humanOptions.canDiscard}
          selectedTileKey={activeSelectedDiscardKey}
        />
      </main>

      <HumanActionPanel
        state={state}
        currentClaim={currentClaim}
        qiangGangCandidate={qiangGangCandidate}
        humanOptions={humanOptions}
        humanSelfHuMethod={humanSelfHuMethod}
        humanSelfHuSpecials={humanSelfHuSpecials}
        dispatch={dispatch}
      />
    </div>
  );
}

export default App;
