import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import "./App.css";
import { installAudioUnlock, playActionVoice } from "./actionAudio";
import TileAsset from "./TileAsset";
import {
  createInitialGameState,
  gameReducer,
  getCurrentClaim,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  huTypeText,
  meldTypeText,
  tileToText,
  type GameState,
  type Meld,
  type Tile,
} from "./mahjongEngine";

function detectMeldChange(
  prevState: GameState,
  nextState: GameState,
): Meld | null {
  for (let index = 0; index < nextState.players.length; index += 1) {
    const prevMelds = prevState.players[index].melds;
    const nextMelds = nextState.players[index].melds;

    for (let meldIndex = 0; meldIndex < nextMelds.length; meldIndex += 1) {
      const nextMeld = nextMelds[meldIndex];
      const prevMeld = prevMelds[meldIndex];

      if (!prevMeld) {
        return nextMeld;
      }

      if (prevMeld.type !== nextMeld.type || prevMeld.tile !== nextMeld.tile) {
        return nextMeld;
      }
    }
  }

  return null;
}

const VOICE_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const AI_DISCARD_DELAY_MS = 1500;
const AI_RESPONSE_DELAY_MS = 1000;

function tileToVoiceText(tile: Tile) {
  const suit = tile[0];
  const rank = Number(tile.slice(1));
  const numberText = VOICE_NUMBERS[rank - 1] ?? `${rank}`;
  const suitText = suit === "W" ? "万" : suit === "T" ? "条" : "筒";
  return `${numberText}${suitText}`;
}

function detectDiscardedTile(
  prevState: GameState,
  nextState: GameState,
): Tile | null {
  for (let index = 0; index < nextState.players.length; index += 1) {
    const prevDiscards = prevState.players[index].discards;
    const nextDiscards = nextState.players[index].discards;
    if (nextDiscards.length > prevDiscards.length) {
      return nextDiscards[nextDiscards.length - 1] ?? null;
    }
  }

  return null;
}

function detectActionVoice(prevState: GameState, nextState: GameState) {
  if (prevState.round !== nextState.round) {
    return null;
  }

  if (!prevState.winInfo && nextState.winInfo) {
    const tileText = tileToVoiceText(nextState.winInfo.tile);
    if (nextState.winInfo.method === "zimo") {
      return `自摸 ${tileText}`;
    }
    if (nextState.winInfo.method === "qianggang") {
      return `抢杠胡 ${tileText}`;
    }
    return `胡 ${tileText}`;
  }

  const meld = detectMeldChange(prevState, nextState);
  if (meld) {
    const tileText = tileToVoiceText(meld.tile);
    if (meld.type === "peng") {
      return `碰 ${tileText}`;
    }
    if (meld.type === "mingGang") {
      return `明杠 ${tileText}`;
    }
    if (meld.type === "anGang") {
      return "暗杠";
    }
    return `补杠 ${tileText}`;
  }

  const discarded = detectDiscardedTile(prevState, nextState);
  if (discarded) {
    return tileToVoiceText(discarded);
  }

  return null;
}

function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );
  const menuRef = useRef<HTMLDetailsElement | null>(null);
  const previousStateRef = useRef<GameState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDiscard, setSelectedDiscard] = useState<{
    key: string;
    handSignature: string;
  } | null>(null);

  const humanOptions = useMemo(() => getHumanTurnOptions(state), [state]);
  const currentClaim = useMemo(() => getCurrentClaim(state), [state]);
  const qiangGangCandidate = useMemo(
    () => getCurrentQiangGangCandidate(state),
    [state],
  );

  useEffect(() => {
    installAudioUnlock();
  }, []);

  useEffect(() => {
    if (state.phase === "gameOver") {
      return;
    }

    const shouldRunAI =
      (state.phase === "playerTurn" &&
        !state.players[state.currentPlayer].isHuman) ||
      (state.phase === "claimDecision" &&
        currentClaim !== null &&
        !state.players[currentClaim.player].isHuman) ||
      (state.phase === "qiangGangDecision" &&
        qiangGangCandidate !== null &&
        !state.players[qiangGangCandidate].isHuman);

    if (!shouldRunAI) {
      return;
    }

    const aiDelay =
      state.phase === "playerTurn" ? AI_DISCARD_DELAY_MS : AI_RESPONSE_DELAY_MS;

    const timer = window.setTimeout(() => {
      dispatch({ type: "AI_STEP" });
    }, aiDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state, currentClaim, qiangGangCandidate]);

  useEffect(() => {
    const previous = previousStateRef.current;
    if (previous) {
      const voice = detectActionVoice(previous, state);
      if (voice) {
        playActionVoice(voice);
      }
    }

    previousStateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const statusText = useMemo(() => {
    if (state.phase === "gameOver") {
      if (!state.winInfo) {
        return "本局结束：流局";
      }

      const winner = state.players[state.winInfo.winner].name;
      const methodText =
        state.winInfo.method === "zimo"
          ? "自摸"
          : state.winInfo.method === "qianggang"
            ? "抢杠胡"
            : "点炮胡";
      const payer =
        typeof state.winInfo.from === "number"
          ? `，由 ${state.players[state.winInfo.from].name} 付分`
          : "";

      return `${winner} ${methodText} ${tileToText(state.winInfo.tile)} · ${huTypeText(
        state.winInfo.hu.type,
      )} ${state.winInfo.hu.baseFan} 番${payer}`;
    }

    if (state.phase === "claimDecision" && currentClaim) {
      const actor = state.players[currentClaim.player].name;
      const from = state.players[currentClaim.from].name;
      const actionText =
        currentClaim.action === "hu"
          ? "胡"
          : currentClaim.action === "mingGang"
            ? "明杠"
            : "碰";
      return `等待响应：${actor} 可${actionText} ${from} 的 ${tileToText(currentClaim.tile)}`;
    }

    if (state.phase === "qiangGangDecision" && state.qiangGang) {
      const actor = state.players[state.qiangGang.actor].name;
      const candidate =
        qiangGangCandidate === null
          ? "玩家"
          : state.players[qiangGangCandidate].name;
      return `等待抢杠胡：${actor} 补杠 ${tileToText(state.qiangGang.tile)}，${candidate} 可胡`;
    }

    const current = state.players[state.currentPlayer].name;
    return `当前行动：${current}`;
  }, [state, currentClaim, qiangGangCandidate]);

  const humanHandSignature = state.players[0].hand.join("|");

  const activeSelectedDiscardKey =
    humanOptions.canDiscard &&
    selectedDiscard?.handSignature === humanHandSignature
      ? selectedDiscard.key
      : null;
  const isHumanActionPending =
    (state.phase === "playerTurn" && state.currentPlayer === 0) ||
    (state.phase === "claimDecision" && currentClaim?.player === 0) ||
    (state.phase === "qiangGangDecision" && qiangGangCandidate === 0);

  const handleHumanTileClick = (tile: Tile, index: number) => {
    if (!humanOptions.canDiscard) {
      return;
    }

    const key = `${tile}-${index}`;
    if (activeSelectedDiscardKey === key) {
      dispatch({ type: "HUMAN_DISCARD", tile });
      setSelectedDiscard(null);
      return;
    }

    setSelectedDiscard({
      key,
      handSignature: humanHandSignature,
    });
  };

  return (
    <div className="mahjong-app">
      <section className="board-meta">
        <details ref={menuRef} className="fab-menu" open={menuOpen}>
          <summary
            className="menu-trigger"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen((current) => !current);
            }}
          >
            ☰
          </summary>
          <div className="menu-panel">
            <button
              type="button"
              className="menu-item btn-main"
              onClick={() => {
                dispatch({ type: "NEXT_ROUND" });
                setMenuOpen(false);
              }}
            >
              再来一局
            </button>
            <button
              type="button"
              className="menu-item btn-sub"
              onClick={() => {
                dispatch({ type: "RESET_GAME" });
                setMenuOpen(false);
              }}
            >
              重置积分
            </button>
          </div>
        </details>
        <div className="meta-chip">第 {state.round} 局</div>
        <div className="meta-status" aria-live="polite">
          {statusText}
        </div>
      </section>

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

      {isHumanActionPending && (
        <section className="action-float" aria-live="polite">
          <div className="action-panel action-panel-floating">
            <h2>操作</h2>
            {state.phase === "playerTurn" && state.currentPlayer === 0 && (
              <>
                <p>双击出牌</p>
                <div className="action-buttons">
                  {humanOptions.selfHu && (
                    <button
                      className="action-btn action-btn-hu"
                      type="button"
                      onClick={() => dispatch({ type: "HUMAN_SELF_HU" })}
                    >
                      {`自摸（${huTypeText(humanOptions.selfHu.type)})`}
                    </button>
                  )}
                  {humanOptions.anGangTiles.map((tile) => (
                    <button
                      key={`angang-${tile}`}
                      className="action-btn action-btn-gang"
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_GANG",
                          gangType: "anGang",
                          tile,
                        })
                      }
                    >
                      <span className="action-button-content">
                        <span className="action-button-label">
                          暗杠 {tileToText(tile)}
                        </span>
                        <TileAsset
                          tile={tile}
                          size="chip"
                          className="action-button-tile"
                        />
                      </span>
                    </button>
                  ))}
                  {humanOptions.buGangTiles.map((tile) => (
                    <button
                      key={`bugang-${tile}`}
                      className="action-btn action-btn-gang"
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_GANG",
                          gangType: "buGang",
                          tile,
                        })
                      }
                    >
                      <span className="action-button-content">
                        <span className="action-button-label">
                          补杠 {tileToText(tile)}
                        </span>
                        <TileAsset
                          tile={tile}
                          size="chip"
                          className="action-button-tile"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {state.phase === "claimDecision" && currentClaim?.player === 0 && (
              <>
                <p>
                  你可
                  {currentClaim.action === "hu"
                    ? "胡"
                    : currentClaim.action === "mingGang"
                      ? "明杠"
                      : "碰"}
                  ：{tileToText(currentClaim.tile)}
                </p>
                <div className="action-buttons">
                  <button
                    className={`action-btn ${
                      currentClaim.action === "hu"
                        ? "action-btn-hu"
                        : currentClaim.action === "mingGang"
                          ? "action-btn-gang"
                          : "action-btn-peng"
                    }`}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "HUMAN_CLAIM_DECISION",
                        accept: true,
                      })
                    }
                  >
                    <span className="action-button-content">
                      <span className="action-button-label">
                        {currentClaim.action === "hu"
                          ? "胡"
                          : currentClaim.action === "mingGang"
                            ? "杠"
                            : "碰"}
                      </span>
                      <TileAsset
                        tile={currentClaim.tile}
                        size="chip"
                        className="action-button-tile"
                      />
                    </span>
                  </button>
                  <button
                    className="action-btn action-btn-pass"
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "HUMAN_CLAIM_DECISION",
                        accept: false,
                      })
                    }
                  >
                    过
                  </button>
                </div>
              </>
            )}

            {state.phase === "qiangGangDecision" &&
              qiangGangCandidate === 0 &&
              state.qiangGang && (
                <>
                  <p>你可抢杠胡：{tileToText(state.qiangGang.tile)}</p>
                  <div className="action-buttons">
                    <button
                      className="action-btn action-btn-hu"
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_QIANG_GANG_DECISION",
                          accept: true,
                        })
                      }
                    >
                      <span className="action-button-content">
                        <span className="action-button-label">抢杠胡</span>
                        <TileAsset
                          tile={state.qiangGang.tile}
                          size="chip"
                          className="action-button-tile"
                        />
                      </span>
                    </button>
                    <button
                      className="action-btn action-btn-pass"
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_QIANG_GANG_DECISION",
                          accept: false,
                        })
                      }
                    >
                      过
                    </button>
                  </div>
                </>
              )}
          </div>
        </section>
      )}
    </div>
  );
}

type PlayerSeatProps = {
  title: string;
  playerIndex: number;
  seatClass: string;
  state: ReturnType<typeof createInitialGameState>;
  showHand: boolean;
  canDiscard?: boolean;
  selectedTileKey?: string | null;
  onTileClick?: (tile: Tile, index: number) => void;
};

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
  const prefersReducedMotion = useReducedMotion();
  const isCurrent =
    state.currentPlayer === playerIndex && state.phase === "playerTurn";
  const handEntries = player.hand.map((tile, index) => ({ tile, index }));
  const meldEnterOffset =
    seatClass === "seat-top"
      ? { x: 0, y: -20 }
      : seatClass === "seat-bottom"
        ? { x: 0, y: 20 }
        : seatClass === "seat-left"
          ? { x: -20, y: 0 }
          : { x: 20, y: 0 };
  const meldEnterRotate =
    seatClass === "seat-top"
      ? -7
      : seatClass === "seat-bottom"
        ? 7
        : seatClass === "seat-left"
          ? -8
          : 8;

  let drawnEntryIndex = -1;
  if (showHand && canDiscard && player.justDrawnTile) {
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
    <section className={`seat ${seatClass} ${isCurrent ? "current" : ""}`}>
      <header className="seat-header">
        <strong>{title}</strong>
        <span>积分：{player.score}</span>
        {!showHand && <span>手牌：{player.hand.length} 张</span>}
      </header>

      <div
        className={`seat-main-row ${showHand ? "seat-main-row-human" : "seat-main-row-ai"}`}
      >
        <div className="melds">
          {player.melds.length === 0 && <span className="muted">暂无副露</span>}
          <AnimatePresence initial={false}>
            {player.melds.map((meld, idx) => (
              <motion.span
                key={`${meld.type}-${meld.tile}-${idx}`}
                className="meld-item"
                layout="position"
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.58,
                        x: meldEnterOffset.x,
                        y: meldEnterOffset.y,
                        rotate: meldEnterRotate,
                        filter: "brightness(1.6) saturate(1.2)",
                      }
                }
                animate={{
                  opacity: 1,
                  scale: [1.18, 0.95, 1],
                  x: 0,
                  y: 0,
                  rotate: [meldEnterRotate * 0.5, 0],
                  filter: [
                    "brightness(1.5) saturate(1.18)",
                    "brightness(1.08) saturate(1.06)",
                    "brightness(1) saturate(1)",
                  ],
                }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.86,
                        x: meldEnterOffset.x * 0.45,
                        y: meldEnterOffset.y * 0.45,
                        rotate: meldEnterRotate * 0.35,
                      }
                }
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 500,
                    damping: 36,
                    mass: 0.72,
                  },
                  opacity: { duration: 0.22, ease: "easeOut" },
                  x: {
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.72,
                  },
                  y: {
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.72,
                  },
                  rotate: { duration: 0.42, ease: [0.2, 0.85, 0.2, 1] },
                  scale: {
                    duration: 0.44,
                    ease: [0.22, 0.9, 0.22, 1],
                    times: [0, 0.58, 1],
                  },
                  filter: {
                    duration: 0.42,
                    ease: "easeOut",
                    times: [0, 0.45, 1],
                  },
                }}
              >
                <span className="meld-label">{meldTypeText(meld.type)}</span>
                <TileAsset tile={meld.tile} size="meld" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {!showHand && (
          <div className="hidden-hand-row" aria-label={`${title} 手牌（背面）`}>
            {player.hand.map((_, index) => (
              <span
                key={`hidden-${playerIndex}-${index}`}
                className="tile hidden-hand-tile"
              >
                <TileAsset size="chip" face="back" />
              </span>
            ))}
          </div>
        )}

        {showHand && (
          <div className="hand-row">
            {normalHandEntries.map(({ tile, index }) => (
              <button
                key={`${tile}-${index}`}
                type="button"
                className={`tile hand ${selectedTileKey === `${tile}-${index}` ? "selected" : ""}`}
                disabled={!canDiscard}
                onClick={() => onTileClick?.(tile, index)}
                aria-label={`打出 ${tileToText(tile)}`}
              >
                <TileAsset tile={tile} size="hand" />
              </button>
            ))}

            {drawnEntry !== null && (
              <>
                <span className="drawn-separator" aria-hidden="true" />
                <button
                  key={`drawn-${drawnEntry.tile}-${drawnEntry.index}`}
                  type="button"
                  className={`tile hand drawn ${selectedTileKey === `${drawnEntry.tile}-${drawnEntry.index}` ? "selected" : ""}`}
                  disabled={!canDiscard}
                  onClick={() =>
                    onTileClick?.(drawnEntry.tile, drawnEntry.index)
                  }
                  aria-label={`打出 ${tileToText(drawnEntry.tile)}（摸到）`}
                >
                  <TileAsset tile={drawnEntry.tile} size="hand" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

type DiscardPoolProps = {
  state: ReturnType<typeof createInitialGameState>;
  wallCount: number;
};

type LaneKey = "top" | "left" | "right" | "bottom";

type DiscardFlightState = {
  layoutId: string;
  tile: Tile;
  playerIndex: number;
  discardIndex: number;
  phase: "center" | "travel";
};

const DISCARD_FLIGHT_HOLD_MS = 420;
const DISCARD_FLIGHT_TOTAL_MS = 1080;

function DiscardPool({ state, wallCount }: DiscardPoolProps) {
  const prefersReducedMotion = useReducedMotion();
  const previousDiscardLengthsRef = useRef<number[] | null>(null);
  const [flight, setFlight] = useState<DiscardFlightState | null>(null);

  useLayoutEffect(() => {
    const currentLengths = state.players.map(
      (player) => player.discards.length,
    );
    const previousLengths = previousDiscardLengthsRef.current;

    if (!previousLengths) {
      previousDiscardLengthsRef.current = currentLengths;
      return;
    }

    const hasReset = currentLengths.some(
      (length, index) => length < previousLengths[index],
    );
    if (hasReset) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlight(null);
      previousDiscardLengthsRef.current = currentLengths;
      return;
    }

    if (prefersReducedMotion) {
      previousDiscardLengthsRef.current = currentLengths;
      return;
    }

    let addedPlayer = -1;
    for (let index = 0; index < currentLengths.length; index += 1) {
      if (currentLengths[index] > previousLengths[index]) {
        addedPlayer = index;
        break;
      }
    }

    if (addedPlayer >= 0) {
      const discardIndex = currentLengths[addedPlayer] - 1;
      const tile = state.players[addedPlayer].discards[discardIndex];
      if (tile) {
        setFlight({
          layoutId: `discard-flight-${state.round}-${addedPlayer}-${discardIndex}-${tile}`,
          tile,
          playerIndex: addedPlayer,
          discardIndex,
          phase: "center",
        });
      }
    }

    previousDiscardLengthsRef.current = currentLengths;
  }, [prefersReducedMotion, state]);

  useEffect(() => {
    if (!flight || flight.phase !== "center") {
      return;
    }

    const holdTimer = window.setTimeout(() => {
      setFlight((current) =>
        current && current.layoutId === flight.layoutId
          ? { ...current, phase: "travel" }
          : current,
      );
    }, DISCARD_FLIGHT_HOLD_MS);

    const cleanupTimer = window.setTimeout(() => {
      setFlight((current) =>
        current && current.layoutId === flight.layoutId ? null : current,
      );
    }, DISCARD_FLIGHT_TOTAL_MS);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [flight]);

  const isFlightTarget = (
    playerIndex: number,
    discardIndex: number,
    tile: Tile,
  ) =>
    flight !== null &&
    flight.playerIndex === playerIndex &&
    flight.discardIndex === discardIndex &&
    flight.tile === tile;

  const renderLane = (key: LaneKey, playerIndex: number) => {
    const player = state.players[playerIndex];
    return (
      <section
        key={key}
        className={`discard-lane discard-lane-${key}`}
        aria-label={`${player.name} 的弃牌`}
      >
        <div className="discard-tiles">
          {player.discards.length === 0 ? (
            <span className="muted">暂无弃牌</span>
          ) : (
            player.discards.map((tile, idx) => {
              const isAnimatedTarget = isFlightTarget(playerIndex, idx, tile);

              if (isAnimatedTarget && flight?.phase === "center") {
                return null;
              }

              if (isAnimatedTarget && flight?.phase === "travel") {
                return (
                  <motion.span
                    key={`${key}-${tile}-${idx}`}
                    className="tile chip discard-chip discard-chip-landing"
                    layoutId={flight.layoutId}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 520,
                        damping: 40,
                        mass: 0.9,
                      },
                    }}
                  >
                    <TileAsset tile={tile} size="chip" />
                  </motion.span>
                );
              }

              return (
                <span
                  key={`${key}-${tile}-${idx}`}
                  className="tile chip discard-chip"
                >
                  <TileAsset tile={tile} size="chip" />
                </span>
              );
            })
          )}
        </div>
      </section>
    );
  };

  return (
    <LayoutGroup id="discard-flight-group">
      <section className="discard-pool" aria-label="中间弃牌区">
        {renderLane("top", 2)}
        {renderLane("left", 3)}
        <section
          className="discard-center"
          aria-live="polite"
          aria-label="牌墙剩余"
        >
          <span className="discard-center-label">牌墙剩余</span>
          <strong className="discard-center-value">{wallCount}</strong>
        </section>
        {renderLane("right", 1)}
        {renderLane("bottom", 0)}
      </section>

      {flight?.phase === "center" && (
        <div className="discard-flight-origin" aria-hidden="true">
          <motion.span
            className="tile chip discard-chip discard-chip-floating"
            layoutId={flight.layoutId}
            initial={{ opacity: 0, scale: 0.76, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <TileAsset tile={flight.tile} size="chip" />
          </motion.span>
        </div>
      )}
    </LayoutGroup>
  );
}

export default App;
