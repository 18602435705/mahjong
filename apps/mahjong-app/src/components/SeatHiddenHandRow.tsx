import { memo } from "react";
import TileAsset from "./TileAsset";

type SeatHiddenHandRowProps = {
  title: string;
  playerIndex: number;
  handCount: number;
};

/**
 * 渲染背面手牌行（AI 未亮牌状态）。
 */
function SeatHiddenHandRow({ title, playerIndex, handCount }: SeatHiddenHandRowProps) {
  return (
    <div className="hidden-hand-row" aria-label={`${title} 手牌（背面）`}>
      {Array.from({ length: handCount }).map((_, index) => (
        <span key={`hidden-${playerIndex}-${index}`} className="tile hidden-hand-tile">
          <TileAsset size="chip" face="back" />
        </span>
      ))}
    </div>
  );
}

export default memo(SeatHiddenHandRow);
