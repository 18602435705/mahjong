import TileAsset from "./TileAsset";
import { tileToText, type Tile } from "../mahjongEngine";

type HandEntry = {
  tile: Tile;
  index: number;
};

type SeatHandRowProps = {
  normalHandEntries: HandEntry[];
  drawnEntry: HandEntry | null;
  canDiscard: boolean;
  selectedTileKey: string | null;
  onTileClick?: (tile: Tile, index: number) => void;
};

/**
 * 渲染明牌手牌行，包含摸牌分隔与选中态。
 */
function SeatHandRow(props: SeatHandRowProps) {
  const {
    normalHandEntries,
    drawnEntry,
    canDiscard,
    selectedTileKey,
    onTileClick,
  } = props;

  return (
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
            onClick={() => onTileClick?.(drawnEntry.tile, drawnEntry.index)}
            aria-label={`打出 ${tileToText(drawnEntry.tile)}（摸到）`}
          >
            <TileAsset tile={drawnEntry.tile} size="hand" />
          </button>
        </>
      )}
    </div>
  );
}

export default SeatHandRow;
