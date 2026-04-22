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
const TING_HU_CACHE_LIMIT = 240;
const tingHuCache = new Map<string, Tile[]>();

function setTingHuCache(
  cache: Map<string, Tile[]>,
  key: string,
  tiles: Tile[],
) {
  cache.set(key, tiles);
  if (cache.size <= TING_HU_CACHE_LIMIT) {
    return;
  }

  const oldestKey = cache.keys().next().value;
  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

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
  const selectedDiscardState =
    humanOptions.canDiscard &&
    selectedDiscard?.handSignature === humanHandSignature
      ? selectedDiscard
      : null;
  const selectedTileIndex =
    typeof selectedDiscardState?.index === "number"
      ? selectedDiscardState.index
      : null;

  const isHumanActionPending =
    (state.phase === PHASE.PLAYER_TURN && state.currentPlayer === 0) ||
    (state.phase === PHASE.CLAIM_DECISION && currentHumanClaims.length > 0) ||
    (state.phase === PHASE.QIANG_GANG_DECISION && qiangGangCandidate === 0);
  const tingHuTiles = useMemo(() => {
    if (
      selectedTileIndex === null ||
      state.phase === PHASE.GAME_OVER ||
      human.hand.length % 3 !== 2
    ) {
      return [] as Tile[];
    }

    if (selectedTileIndex < 0 || selectedTileIndex >= human.hand.length) {
      return [] as Tile[];
    }

    const remainingHand = human.hand.filter(
      (_, index) => index !== selectedTileIndex,
    );
    const cacheKey = `${remainingHand.join("|")}#${human.melds.length}`;
    const cachedTiles = tingHuCache.get(cacheKey);
    if (cachedTiles) {
      return cachedTiles;
    }

    const resolvedTiles = ALL_TILES.filter(
      (tile) => evaluateHu([...remainingHand, tile], human.melds) !== null,
    );
    setTingHuCache(tingHuCache, cacheKey, resolvedTiles);

    return resolvedTiles;
  }, [selectedTileIndex, state.phase, human.hand, human.melds]);

  if (!isHumanActionPending && tingHuTiles.length === 0) {
    return null;
  }

  return (
    <section
      className={inline ? "action-inline" : "action-float"}
      aria-live="polite"
    >
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

        {state.phase === PHASE.CLAIM_DECISION &&
          currentHumanClaims.length > 0 && (
            <ClaimDecisionActions
              currentClaims={currentHumanClaims}
              dispatch={dispatch}
            />
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
