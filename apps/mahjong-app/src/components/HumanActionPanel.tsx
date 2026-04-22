import { useMemo } from "react";
import "./HumanActionPanel.css";
import ClaimDecisionActions from "./ClaimDecisionActions";
import PlayerTurnActions from "./PlayerTurnActions";
import QiangGangActions from "./QiangGangActions";
import TileAsset from "./TileAsset";
import {
  evaluateHu,
  getCurrentHumanClaims,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  getSelfHuMethod,
  getSelfHuSpecials,
  PHASE,
  SUIT,
  WIN_METHOD,
  type Tile,
} from "../mahjongEngine";
import { useGameStore } from "../store/gameStore";

type HumanActionPanelProps = {
  inline?: boolean;
};

const ALL_TILES: Tile[] = [SUIT.WAN, SUIT.BAMBOO, SUIT.DOT].flatMap((suit) =>
  Array.from({ length: 9 }, (_, index) => `${suit}${index + 1}` as Tile),
);

/**
 * 渲染人类玩家的可执行动作按钮（胡/杠/碰/过等）。
 */
function HumanActionPanel({ inline = false }: HumanActionPanelProps) {
  const state = useGameStore((store) => store.game);
  const dispatch = useGameStore((store) => store.dispatch);
  const selectedDiscard = useGameStore((store) => store.selectedDiscard);
  const human = state.players[0];

  const currentHumanClaims = getCurrentHumanClaims(state);
  const qiangGangCandidate = getCurrentQiangGangCandidate(state);
  const humanOptions = getHumanTurnOptions(state);
  const humanSelfHuMethod =
    humanOptions.selfHuMethod ?? getSelfHuMethod(state, 0) ?? WIN_METHOD.ZIMO;
  const humanSelfHuSpecials =
    humanOptions.selfHuSpecials ?? getSelfHuSpecials(state, 0);
  const humanHandSignature = human.hand.join("|");
  const selectedTileKey =
    humanOptions.canDiscard && selectedDiscard?.handSignature === humanHandSignature
      ? selectedDiscard.key
      : null;

  const isHumanActionPending =
    (state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0) ||
    (state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0) ||
    (state.phase === PHASE.QIANG_GANG_DECISION && qiangGangCandidate === 0);
  const tingHuTiles = useMemo(() => {
    if (
      !selectedTileKey ||
      state.phase === PHASE.GAME_OVER ||
      human.hand.length % 3 !== 2
    ) {
      return [] as Tile[];
    }

    const splitIndex = selectedTileKey.lastIndexOf("-");
    if (splitIndex <= 0) {
      return [] as Tile[];
    }

    const selectedTile = selectedTileKey.slice(0, splitIndex) as Tile;
    const selectedIndex = Number(selectedTileKey.slice(splitIndex + 1));
    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= human.hand.length ||
      human.hand[selectedIndex] !== selectedTile
    ) {
      return [] as Tile[];
    }

    const remainingHand = human.hand.filter((_, index) => index !== selectedIndex);

    return ALL_TILES.filter(
      (tile) => evaluateHu([...remainingHand, tile], human.melds) !== null,
    );
  }, [selectedTileKey, state.phase, human.hand, human.melds]);

  if (!isHumanActionPending && tingHuTiles.length === 0) {
    return null;
  }

  return (
    <section className={inline ? "action-inline" : "action-float"} aria-live="polite">
      <div className="action-row">
        {tingHuTiles.length > 0 && (
          <aside className="action-ting-hint" aria-label="听牌可胡列表">
            <span className="action-ting-hint-label">可胡</span>
            <div className="action-ting-hint-tiles">
              {tingHuTiles.map((tile) => (
                <TileAsset
                  key={`action-ting-hu-${tile}`}
                  tile={tile}
                  size="chip"
                  className="action-ting-hint-tile"
                />
              ))}
            </div>
          </aside>
        )}

        {state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0 && (
          <PlayerTurnActions
            humanOptions={humanOptions}
            humanSelfHuMethod={humanSelfHuMethod}
            humanSelfHuSpecials={humanSelfHuSpecials}
            dispatch={dispatch}
          />
        )}

        {state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0 && (
          <ClaimDecisionActions currentClaims={currentHumanClaims} dispatch={dispatch} />
        )}

        {state.phase === PHASE.QIANG_GANG_DECISION &&
          qiangGangCandidate === 0 &&
          state.qiangGang && (
            <QiangGangActions tile={state.qiangGang.tile} dispatch={dispatch} />
          )}
      </div>
    </section>
  );
}

export default HumanActionPanel;
