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
  const meldEnterOffsetX = meldEnterOffset.x;
  const meldEnterOffsetY = meldEnterOffset.y;

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
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.92,
                      x: meldEnterOffsetX,
                      y: meldEnterOffsetY,
                      rotate: meldEnterRotate * 0.3,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.96,
                      x: meldEnterOffsetX * 0.25,
                      y: meldEnterOffsetY * 0.25,
                      rotate: meldEnterRotate * 0.2,
                    }
              }
              transition={{
                duration: 0.2,
                ease: "easeOut",
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
