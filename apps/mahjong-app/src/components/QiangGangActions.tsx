import type { Dispatch } from "react";
import TileAsset from "./TileAsset";
import {
  GAME_ACTION,
  type GameAction,
  type Tile,
} from "../mahjongEngine";

type QiangGangActionsProps = {
  tile: Tile;
  dispatch: Dispatch<GameAction>;
};

/**
 * 渲染抢杠胡阶段的动作按钮（胡或过）。
 */
function QiangGangActions({ tile, dispatch }: QiangGangActionsProps) {
  return (
    <>
      <div className="action-buttons">
        <button
          className="action-btn action-btn-hu"
          type="button"
          onClick={() =>
            dispatch({
              type: GAME_ACTION.HUMAN_QIANG_GANG_DECISION,
              accept: true,
            })
          }
        >
          <span className="action-button-content">
            <span className="action-button-label">抢杠胡</span>
            <TileAsset tile={tile} size="chip" className="action-button-tile" />
          </span>
        </button>
        <button
          className="action-btn action-btn-pass"
          type="button"
          onClick={() =>
            dispatch({
              type: GAME_ACTION.HUMAN_QIANG_GANG_DECISION,
              accept: false,
            })
          }
        >
          过
        </button>
      </div>
    </>
  );
}

export default QiangGangActions;
