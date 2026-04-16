import { useEffect, useReducer, useState } from "react";
import "./App.css";
import { installAudioUnlock } from "./actionAudio";
import BoardMeta from "./components/BoardMeta";
import DiscardPool from "./components/DiscardPool";
import HumanActionPanel from "./components/HumanActionPanel";
import PlayerSeat from "./components/PlayerSeat";
import { useAiStep } from "./hooks/useAiStep";
import { useActionVoice } from "./hooks/useActionVoice";
import { useGameViewModel } from "./hooks/useGameViewModel";
import {
  createInitialGameState,
  GAME_ACTION,
  gameReducer,
  INITIAL_DEAL_PRESET,
  INITIAL_DEAL_PRESET_OPTIONS,
  type InitialDealPresetId,
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
  const [selectedPresetId, setSelectedPresetId] = useState<InitialDealPresetId>(
    INITIAL_DEAL_PRESET.RANDOM,
  );
  const {
    statusText,
    humanOptions,
    currentClaim,
    currentHumanClaims,
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

  return (
    <div className="mahjong-app">
      <BoardMeta
        round={state.round}
        statusText={statusText}
        presetOptions={INITIAL_DEAL_PRESET_OPTIONS}
        selectedPresetId={selectedPresetId}
        onPresetChange={(presetId) => {
          setSelectedPresetId(presetId);
          dispatch({ type: GAME_ACTION.RESET_GAME, presetId });
        }}
        onNextRound={() => {
          dispatch({ type: GAME_ACTION.NEXT_ROUND, presetId: selectedPresetId });
        }}
        onResetGame={() => {
          dispatch({ type: GAME_ACTION.RESET_GAME, presetId: selectedPresetId });
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
        currentHumanClaims={currentHumanClaims}
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
