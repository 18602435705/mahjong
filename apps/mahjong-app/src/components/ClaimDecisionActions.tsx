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
  currentClaims: ClaimRequest[];
  dispatch: Dispatch<GameAction>;
};

/**
 * 渲染吃碰杠胡响应阶段的动作按钮（接牌或过）。
 */
function ClaimDecisionActions({ currentClaims, dispatch }: ClaimDecisionActionsProps) {
  const tile = currentClaims[0]?.tile;
  if (!tile) {
    return null;
  }

  return (
    <>
      <p>
        你可操作：{tileToText(tile)}
      </p>
      <div className="action-buttons">
        {currentClaims.map((claim) => (
          <button
            key={`${claim.action}-${claim.tile}-${claim.from}`}
            className={`action-btn ${
              claim.action === CLAIM_ACTION.HU
                ? "action-btn-hu"
                : claim.action === CLAIM_ACTION.MING_GANG
                  ? "action-btn-gang"
                  : "action-btn-peng"
            }`}
            type="button"
            onClick={() =>
              dispatch({
                type: GAME_ACTION.HUMAN_CLAIM_DECISION,
                accept: true,
                claimAction: claim.action,
              })
            }
          >
            <span className="action-button-content">
              <span className="action-button-label">
                {claim.action === CLAIM_ACTION.HU
                  ? "胡"
                  : claim.action === CLAIM_ACTION.MING_GANG
                    ? "杠"
                    : "碰"}
              </span>
              <TileAsset tile={claim.tile} size="chip" className="action-button-tile" />
            </span>
          </button>
        ))}
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
