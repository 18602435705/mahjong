import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import TileAsset from "./TileAsset";
import { MELD_TYPE, meldTypeText, type Meld } from "../mahjongEngine";

type SeatMeldListProps = {
  melds: Meld[];
  seatClass: string;
  shouldShowHand: boolean;
};

/**
 * 渲染副露区域，并按座位方向展示入场动画。
 */
function SeatMeldList({ melds, seatClass, shouldShowHand }: SeatMeldListProps) {
  const prefersReducedMotion = useReducedMotion();
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

  return (
    <div className="melds">
      {melds.length === 0 && <span className="muted">暂无副露</span>}
      <AnimatePresence initial={false}>
        {melds.map((meld, idx) => {
          const hideTileFace = meld.type === MELD_TYPE.AN_GANG && !shouldShowHand;

          return (
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
              <TileAsset
                tile={meld.tile}
                size="meld"
                face={hideTileFace ? "back" : "front"}
              />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default SeatMeldList;
