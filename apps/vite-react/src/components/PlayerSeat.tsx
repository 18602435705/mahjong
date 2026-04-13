import "./PlayerSeat.css";
import SeatHandRow from "./SeatHandRow";
import SeatHeader from "./SeatHeader";
import SeatHiddenHandRow from "./SeatHiddenHandRow";
import SeatMeldList from "./SeatMeldList";
import {
  PHASE,
  type GameState,
  type Tile,
} from "../mahjongEngine";

type PlayerSeatProps = {
  title: string;
  playerIndex: number;
  seatClass: string;
  state: GameState;
  showHand: boolean;
  canDiscard?: boolean;
  selectedTileKey?: string | null;
  onTileClick?: (tile: Tile, index: number) => void;
};

/**
 * 渲染单个座位的玩家信息、手牌/暗牌、副露与动效表现。
 */
function PlayerSeat(props: PlayerSeatProps) {
  const {
    title,
    playerIndex,
    seatClass,
    state,
    showHand,
    canDiscard = false,
    selectedTileKey = null,
    onTileClick,
  } = props;
  const player = state.players[playerIndex];
  const isCurrent =
    state.currentPlayer === playerIndex && state.phase === PHASE.PLAYER_TURN;
  const shouldShowHand = showHand || state.phase === PHASE.GAME_OVER;
  const isRevealedAIHand = shouldShowHand && !showHand;
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
  if (shouldShowHand && canDiscard && player.justDrawnTile && !isDealerOpeningTurn) {
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

        {shouldShowHand && (
          <SeatHandRow
            normalHandEntries={normalHandEntries}
            drawnEntry={drawnEntry}
            canDiscard={canDiscard}
            selectedTileKey={selectedTileKey}
            onTileClick={onTileClick}
          />
        )}
      </div>
    </section>
  );
}

export default PlayerSeat;
