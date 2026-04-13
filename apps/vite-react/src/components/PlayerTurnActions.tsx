import type { Dispatch } from "react";
import TileAsset from "./TileAsset";
import {
  calculateWinTotalFan,
  GAME_ACTION,
  MELD_TYPE,
  getHumanTurnOptions,
  huSummaryText,
  tileToText,
  winMethodText,
  type GameAction,
  type HuSpecialType,
  type WinMethod,
} from "../mahjongEngine";

type PlayerTurnActionsProps = {
  humanOptions: ReturnType<typeof getHumanTurnOptions>;
  humanSelfHuMethod: WinMethod;
  humanSelfHuSpecials: HuSpecialType[];
  dispatch: Dispatch<GameAction>;
};

/**
 * 渲染玩家自己回合可执行的动作按钮（自摸、暗杠、补杠）。
 */
function PlayerTurnActions(props: PlayerTurnActionsProps) {
  const { humanOptions, humanSelfHuMethod, humanSelfHuSpecials, dispatch } = props;

  return (
    <>
      <p>双击出牌</p>
      <div className="action-buttons">
        {humanOptions.selfHu && (
          <button
            className="action-btn action-btn-hu"
            type="button"
            onClick={() => dispatch({ type: GAME_ACTION.HUMAN_SELF_HU })}
          >
            {`${winMethodText(
              humanSelfHuMethod,
              humanSelfHuSpecials,
            )}（${huSummaryText(humanOptions.selfHu)} ${
              calculateWinTotalFan(
                humanOptions.selfHu,
                humanSelfHuMethod,
                humanSelfHuSpecials,
              ).totalFan
            } 番）`}
          </button>
        )}
        {humanOptions.anGangTiles.map((tile) => (
          <button
            key={`angang-${tile}`}
            className="action-btn action-btn-gang"
            type="button"
            onClick={() =>
              dispatch({
                type: GAME_ACTION.HUMAN_GANG,
                gangType: MELD_TYPE.AN_GANG,
                tile,
              })
            }
          >
            <span className="action-button-content">
              <span className="action-button-label">暗杠 {tileToText(tile)}</span>
              <TileAsset tile={tile} size="chip" className="action-button-tile" />
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
                type: GAME_ACTION.HUMAN_GANG,
                gangType: MELD_TYPE.BU_GANG,
                tile,
              })
            }
          >
            <span className="action-button-content">
              <span className="action-button-label">补杠 {tileToText(tile)}</span>
              <TileAsset tile={tile} size="chip" className="action-button-tile" />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

export default PlayerTurnActions;
