import type { Dispatch } from "react";
import TileAsset from "./TileAsset";
import {
  CLAIM_ACTION,
  GAME_ACTION,
  tileToText,
  type ClaimRequest,
  type GameAction,
} from "../mahjongEngine";

type ClaimDecisionActionsProps = {
  currentClaim: ClaimRequest;
  dispatch: Dispatch<GameAction>;
};

/**
 * 渲染吃碰杠胡响应阶段的动作按钮（接牌或过）。
 */
function ClaimDecisionActions({ currentClaim, dispatch }: ClaimDecisionActionsProps) {
  return (
    <>
      <p>
        你可
        {currentClaim.action === CLAIM_ACTION.HU
          ? "胡"
          : currentClaim.action === CLAIM_ACTION.MING_GANG
            ? "明杠"
            : "碰"}
        ：{tileToText(currentClaim.tile)}
      </p>
      <div className="action-buttons">
        <button
          className={`action-btn ${
            currentClaim.action === CLAIM_ACTION.HU
              ? "action-btn-hu"
              : currentClaim.action === CLAIM_ACTION.MING_GANG
                ? "action-btn-gang"
                : "action-btn-peng"
          }`}
          type="button"
          onClick={() =>
            dispatch({
              type: GAME_ACTION.HUMAN_CLAIM_DECISION,
              accept: true,
            })
          }
        >
          <span className="action-button-content">
            <span className="action-button-label">
              {currentClaim.action === CLAIM_ACTION.HU
                ? "胡"
                : currentClaim.action === CLAIM_ACTION.MING_GANG
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
              type: GAME_ACTION.HUMAN_CLAIM_DECISION,
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

export default ClaimDecisionActions;
