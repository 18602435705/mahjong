import "./DiscardPool.css";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import TileAsset from "./TileAsset";
import DiscardLane, { type DiscardFlightState } from "./DiscardLane";
import { useGameStore } from "../store/gameStore";

const DISCARD_FLIGHT_HOLD_MS = 420;
const DISCARD_FLIGHT_TOTAL_MS = 1080;

/**
 * 渲染中央弃牌区与牌墙剩余，并驱动弃牌飞入动画。
 */
function DiscardPool() {
  const state = useGameStore((store) => store.game);
  const wallCount = state.wall.length;
  const prefersReducedMotion = useReducedMotion();
  const previousDiscardLengthsRef = useRef<number[] | null>(null);
  const [flight, setFlight] = useState<DiscardFlightState | null>(null);

  useLayoutEffect(() => {
    const currentLengths = state.players.map((player) => player.discards.length);
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

  return (
    <LayoutGroup id="discard-flight-group">
      <section className="discard-pool" aria-label="中间弃牌区">
        <DiscardLane
          laneKey="top"
          playerIndex={2}
          playerName={state.players[2].name}
          discards={state.players[2].discards}
          flight={flight}
        />
        <DiscardLane
          laneKey="left"
          playerIndex={3}
          playerName={state.players[3].name}
          discards={state.players[3].discards}
          flight={flight}
        />
        <section
          className="discard-center"
          aria-live="polite"
          aria-label="牌墙剩余"
        >
          <span className="discard-center-label">牌墙剩余</span>
          <strong className="discard-center-value">{wallCount}</strong>
        </section>
        <DiscardLane
          laneKey="right"
          playerIndex={1}
          playerName={state.players[1].name}
          discards={state.players[1].discards}
          flight={flight}
        />
        <DiscardLane
          laneKey="bottom"
          playerIndex={0}
          playerName={state.players[0].name}
          discards={state.players[0].discards}
          flight={flight}
        />
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

export default DiscardPool;
