import { useEffect, useMemo, useReducer } from "react";
import "./App.css";
import {
  createInitialGameState,
  gameReducer,
  getCurrentClaim,
  getCurrentQiangGangCandidate,
  getHumanTurnOptions,
  huTypeText,
  meldTypeText,
  tileToText,
  type Tile,
} from "./mahjongEngine";

function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );

  const humanOptions = useMemo(() => getHumanTurnOptions(state), [state]);
  const currentClaim = useMemo(() => getCurrentClaim(state), [state]);
  const qiangGangCandidate = useMemo(
    () => getCurrentQiangGangCandidate(state),
    [state],
  );

  useEffect(() => {
    if (state.phase === "gameOver") {
      return;
    }

    const shouldRunAI =
      (state.phase === "playerTurn" &&
        !state.players[state.currentPlayer].isHuman) ||
      (state.phase === "claimDecision" &&
        currentClaim !== null &&
        !state.players[currentClaim.player].isHuman) ||
      (state.phase === "qiangGangDecision" &&
        qiangGangCandidate !== null &&
        !state.players[qiangGangCandidate].isHuman);

    if (!shouldRunAI) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: "AI_STEP" });
    }, 560);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state, currentClaim, qiangGangCandidate]);

  const statusText = useMemo(() => {
    if (state.phase === "gameOver") {
      if (!state.winInfo) {
        return "本局结束：流局（无流局结算）";
      }

      const winner = state.players[state.winInfo.winner].name;
      const methodText =
        state.winInfo.method === "zimo"
          ? "自摸"
          : state.winInfo.method === "qianggang"
            ? "抢杠胡"
            : "点炮胡";
      const payer =
        typeof state.winInfo.from === "number"
          ? `，由 ${state.players[state.winInfo.from].name} 付分`
          : "";

      return `${winner} ${methodText} ${tileToText(state.winInfo.tile)} · ${huTypeText(
        state.winInfo.hu.type,
      )} ${state.winInfo.hu.baseFan} 番${payer}`;
    }

    if (state.phase === "claimDecision" && currentClaim) {
      const actor = state.players[currentClaim.player].name;
      const from = state.players[currentClaim.from].name;
      const actionText =
        currentClaim.action === "hu"
          ? "胡"
          : currentClaim.action === "mingGang"
            ? "明杠"
            : "碰";
      return `等待响应：${actor} 可${actionText} ${from} 的 ${tileToText(currentClaim.tile)}`;
    }

    if (state.phase === "qiangGangDecision" && state.qiangGang) {
      const actor = state.players[state.qiangGang.actor].name;
      const candidate =
        qiangGangCandidate === null
          ? "玩家"
          : state.players[qiangGangCandidate].name;
      return `等待抢杠胡：${actor} 补杠 ${tileToText(state.qiangGang.tile)}，${candidate} 可胡`;
    }

    const current = state.players[state.currentPlayer].name;
    return `当前行动：${current}`;
  }, [state, currentClaim, qiangGangCandidate]);

  return (
    <div className="mahjong-app">
      <header className="topbar">
        <div className="topbar-title">
          <h1>川麻单机局</h1>
          <p className="subtitle">
            规则：可碰可杠不可吃｜禁止点炮（仅自摸/抢杠胡）｜无换三张｜无定缺｜非血战｜无流局结算
          </p>
        </div>
        <div className="round-actions">
          <button
            type="button"
            className="btn-main"
            onClick={() => dispatch({ type: "NEXT_ROUND" })}
          >
            再来一局
          </button>
          <button
            type="button"
            className="btn-sub"
            onClick={() => dispatch({ type: "RESET_GAME" })}
          >
            重置积分
          </button>
        </div>
      </header>

      <section className="board-meta">
        <div className="meta-chip">第 {state.round} 局</div>
        <div className="meta-chip">牌墙剩余：{state.wall.length}</div>
        <div className="status meta-status">{statusText}</div>
      </section>

      <main className="table-grid">
        <PlayerSeat
          title={state.players[2].name}
          playerIndex={2}
          state={state}
          showHand={false}
          seatClass="seat-top"
        />
        <PlayerSeat
          title={state.players[3].name}
          playerIndex={3}
          state={state}
          showHand={false}
          seatClass="seat-left"
        />

        <section className="center-panel">
          <div className="action-panel">
            <h2>操作区</h2>
            {state.phase === "playerTurn" && state.currentPlayer === 0 && (
              <>
                <p>点击下方手牌出牌</p>
                <div className="action-buttons">
                  {humanOptions.selfHu && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "HUMAN_SELF_HU" })}
                    >
                      自摸（{huTypeText(humanOptions.selfHu.type)}{" "}
                      {humanOptions.selfHu.baseFan} 番）
                    </button>
                  )}
                  {humanOptions.anGangTiles.map((tile) => (
                    <button
                      key={`angang-${tile}`}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_GANG",
                          gangType: "anGang",
                          tile,
                        })
                      }
                    >
                      暗杠 {tileToText(tile)}
                    </button>
                  ))}
                  {humanOptions.buGangTiles.map((tile) => (
                    <button
                      key={`bugang-${tile}`}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_GANG",
                          gangType: "buGang",
                          tile,
                        })
                      }
                    >
                      补杠 {tileToText(tile)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {state.phase === "claimDecision" && currentClaim?.player === 0 && (
              <>
                <p>
                  你可
                  {currentClaim.action === "hu"
                    ? "胡"
                    : currentClaim.action === "mingGang"
                      ? "明杠"
                      : "碰"}
                  ：{tileToText(currentClaim.tile)}
                </p>
                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: "HUMAN_CLAIM_DECISION", accept: true })
                    }
                  >
                    执行
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: "HUMAN_CLAIM_DECISION", accept: false })
                    }
                  >
                    过
                  </button>
                </div>
              </>
            )}

            {state.phase === "qiangGangDecision" &&
              qiangGangCandidate === 0 &&
              state.qiangGang && (
                <>
                  <p>你可抢杠胡：{tileToText(state.qiangGang.tile)}</p>
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_QIANG_GANG_DECISION",
                          accept: true,
                        })
                      }
                    >
                      胡
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "HUMAN_QIANG_GANG_DECISION",
                          accept: false,
                        })
                      }
                    >
                      过
                    </button>
                  </div>
                </>
              )}

            {!(
              (state.phase === "playerTurn" && state.currentPlayer === 0) ||
              (state.phase === "claimDecision" && currentClaim?.player === 0) ||
              (state.phase === "qiangGangDecision" && qiangGangCandidate === 0)
            ) && <p>等待 AI 操作中...</p>}
          </div>

          <div className="log-panel">
            <h2>对局日志</h2>
            <ul>
              {state.logs.map((log, index) => (
                <li key={`${log}-${index}`}>{log}</li>
              ))}
            </ul>
          </div>
        </section>

        <PlayerSeat
          title={state.players[1].name}
          playerIndex={1}
          state={state}
          showHand={false}
          seatClass="seat-right"
        />

        <PlayerSeat
          title={state.players[0].name}
          playerIndex={0}
          state={state}
          showHand
          seatClass="seat-bottom"
          onDiscard={(tile) => dispatch({ type: "HUMAN_DISCARD", tile })}
          canDiscard={humanOptions.canDiscard}
        />
      </main>
    </div>
  );
}

type PlayerSeatProps = {
  title: string;
  playerIndex: number;
  seatClass: string;
  state: ReturnType<typeof createInitialGameState>;
  showHand: boolean;
  canDiscard?: boolean;
  onDiscard?: (tile: Tile) => void;
};

function PlayerSeat(props: PlayerSeatProps) {
  const {
    title,
    playerIndex,
    seatClass,
    state,
    showHand,
    canDiscard = false,
    onDiscard,
  } = props;
  const player = state.players[playerIndex];
  const isCurrent =
    state.currentPlayer === playerIndex && state.phase === "playerTurn";

  return (
    <section className={`seat ${seatClass} ${isCurrent ? "current" : ""}`}>
      <header className="seat-header">
        <strong>{title}</strong>
        <span>积分：{player.score}</span>
        {!showHand && <span>手牌：{player.hand.length} 张</span>}
      </header>

      <div className="melds">
        {player.melds.length === 0 ? (
          <span className="muted">暂无副露</span>
        ) : (
          player.melds.map((meld, idx) => (
            <span
              key={`${meld.type}-${meld.tile}-${idx}`}
              className="meld-item"
            >
              {meldTypeText(meld.type)} {tileToText(meld.tile)}
            </span>
          ))
        )}
      </div>

      <div className="discards">
        {player.discards.length === 0 ? (
          <span className="muted">未出牌</span>
        ) : (
          player.discards.map((tile, idx) => (
            <span
              key={`${tile}-${idx}`}
              className={`tile chip ${tileClass(tile)}`}
            >
              {tileToText(tile)}
            </span>
          ))
        )}
      </div>

      {showHand && (
        <div className="hand-row">
          {player.hand.map((tile, idx) => (
            <button
              key={`${tile}-${idx}`}
              type="button"
              className={`tile hand ${tileClass(tile)}`}
              disabled={!canDiscard}
              onClick={() => onDiscard?.(tile)}
            >
              {tileToText(tile)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function tileClass(tile: Tile) {
  if (tile.startsWith("W")) return "wan";
  if (tile.startsWith("T")) return "tiao";
  return "tong";
}

export default App;
