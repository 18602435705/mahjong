import { motion } from "motion/react";
import TileAsset from "./TileAsset";
import { type Tile } from "../mahjongEngine";

export type LaneKey = "top" | "left" | "right" | "bottom";

export type DiscardFlightState = {
  layoutId: string;
  tile: Tile;
  playerIndex: number;
  discardIndex: number;
  phase: "center" | "travel";
};

type DiscardLaneProps = {
  laneKey: LaneKey;
  playerIndex: number;
  playerName: string;
  discards: Tile[];
  flight: DiscardFlightState | null;
};

/**
 * 渲染单侧弃牌列，并处理飞牌落位占位逻辑。
 */
function DiscardLane(props: DiscardLaneProps) {
  const { laneKey, playerIndex, playerName, discards, flight } = props;

  const isFlightTarget = (discardIndex: number, tile: Tile) =>
    flight !== null &&
    flight.playerIndex === playerIndex &&
    flight.discardIndex === discardIndex &&
    flight.tile === tile;

  return (
    <section
      className={`discard-lane discard-lane-${laneKey}`}
      aria-label={`${playerName} 的弃牌`}
    >
      <div className="discard-tiles">
        {discards.length === 0 ? (
          <span className="muted">暂无弃牌</span>
        ) : (
          discards.map((tile, idx) => {
            const isAnimatedTarget = isFlightTarget(idx, tile);

            if (isAnimatedTarget && flight?.phase === "center") {
              return null;
            }

            if (isAnimatedTarget && flight?.phase === "travel") {
              return (
                <motion.span
                  key={`${laneKey}-${tile}-${idx}`}
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
              <span key={`${laneKey}-${tile}-${idx}`} className="tile chip discard-chip">
                <TileAsset tile={tile} size="chip" />
              </span>
            );
          })
        )}
      </div>
    </section>
  );
}

export default DiscardLane;
