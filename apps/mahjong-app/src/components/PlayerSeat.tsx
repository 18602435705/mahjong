import { useCallback } from "react";
import "./PlayerSeat.css";
import HumanActionPanel from "./HumanActionPanel";
import SeatHandRow from "./SeatHandRow";
import SeatHeader from "./SeatHeader";
import SeatHiddenHandRow from "./SeatHiddenHandRow";
import SeatMeldList from "./SeatMeldList";
import {
  GAME_ACTION,
  getCurrentHumanClaims,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  PHASE,
  type Tile,
} from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";

type PlayerSeatProps = {
  playerIndex: number;
  seatClass: string;
  showHand: boolean;
};

/**
 * 渲染单个座位的玩家信息、手牌/暗牌、副露与动效表现。
 */
function PlayerSeat(props: PlayerSeatProps) {
  const { playerIndex, seatClass, showHand } = props;
  const state = useGameStore((store) => store.game);
  const dispatch = useGameStore((store) => store.dispatch);
  const selectedDiscard = useGameStore((store) => store.selectedDiscard);
  const setSelectedDiscard = useGameStore((store) => store.setSelectedDiscard);

  const player = state.players[playerIndex];
  const title = player.name;
  const canDiscard =
    playerIndex === 0 ? getHumanTurnOptions(state).canDiscard : false;
  const humanHandSignature = state.players[0].hand.join("|");
  const selectedTileKey =
    canDiscard && selectedDiscard?.handSignature === humanHandSignature
      ? selectedDiscard.key
      : null;

  const handleHumanTileClick = useCallback(
    (tile: Tile, index: number) => {
      if (playerIndex !== 0 || !canDiscard) {
        return;
      }

      const key = `${tile}-${index}`;
      if (selectedTileKey === key) {
        dispatch({ type: GAME_ACTION.HUMAN_DISCARD, tile });
        setSelectedDiscard(null);
        return;
      }

      setSelectedDiscard({
        key,
        index,
        handSignature: humanHandSignature,
      });
    },
    [
      playerIndex,
      canDiscard,
      selectedTileKey,
      dispatch,
      setSelectedDiscard,
      humanHandSignature,
    ],
  );

  const isCurrent =
    state.currentPlayer === playerIndex && state.phase === PHASE.PLAYER_TURN;
  const shouldShowHand = showHand || state.phase === PHASE.GAME_OVER;
  const isRevealedAIHand = shouldShowHand && !showHand;
  const currentHumanClaims = getCurrentHumanClaims(state);
  const qiangGangCandidate = getCurrentQiangGangCandidate(state);
  const isHumanActionPending =
    playerIndex === 0 &&
    ((state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0) ||
      (state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0) ||
      (state.phase === PHASE.QIANG_GANG_DECISION && qiangGangCandidate === 0));
  const isDealerOpeningTurn =
    playerIndex === 0 &&
    state.currentPlayer === 0 &&
    state.phase === PHASE.PLAYER_TURN &&
    state.players.every(
      (seatPlayer) =>
        seatPlayer.discards.length === 0 && seatPlayer.melds.length === 0,
    );
  const handEntries = player.hand.map((tile, index) => ({ tile, index }));

  let drawnEntryIndex = -1;
  if (
    shouldShowHand &&
    canDiscard &&
    player.justDrawnTile &&
    !isDealerOpeningTurn
  ) {
    for (let i = handEntries.length - 1; i >= 0; i -= 1) {
      if (handEntries[i].tile === player.justDrawnTile) {
        drawnEntryIndex = i;
        break;
      }
    }
  }

  const drawnEntry = drawnEntryIndex >= 0 ? handEntries[drawnEntryIndex] : null;
  const normalHandEntries =
    drawnEntryIndex >= 0
      ? handEntries.filter((_, index) => index !== drawnEntryIndex)
      : handEntries;

  return (
    <section
      className={`seat ${seatClass} ${isCurrent ? "current" : ""} ${
        isHumanActionPending ? "human-turn-active" : ""
      } ${
        isRevealedAIHand ? "revealed-ai-hand" : ""
      }`}
    >
      <SeatHeader
        title={title}
        score={player.score}
        handCount={shouldShowHand ? undefined : player.hand.length}
      />

      <div
        className={`seat-main-row ${showHand ? "seat-main-row-human" : "seat-main-row-ai"}`}
      >
        <SeatMeldList
          melds={player.melds}
          seatClass={seatClass}
          shouldShowHand={shouldShowHand}
        />

        {!shouldShowHand && (
          <SeatHiddenHandRow
            title={title}
            playerIndex={playerIndex}
            handCount={player.hand.length}
          />
        )}

        {shouldShowHand &&
          (playerIndex === 0 ? (
            <div
              className={`human-hand-area ${
                isHumanActionPending ? "human-hand-area-with-actions" : ""
              }`}
            >
              <HumanActionPanel inline />
              <SeatHandRow
                normalHandEntries={normalHandEntries}
                drawnEntry={drawnEntry}
                canDiscard={canDiscard}
                selectedTileKey={selectedTileKey}
                onTileClick={handleHumanTileClick}
              />
            </div>
          ) : (
            <SeatHandRow
              normalHandEntries={normalHandEntries}
              drawnEntry={drawnEntry}
              canDiscard={canDiscard}
              selectedTileKey={selectedTileKey}
            />
          ))}
      </div>
    </section>
  );
}

export default PlayerSeat;
