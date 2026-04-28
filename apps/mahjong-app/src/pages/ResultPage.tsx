import { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  clearStoredMatchResult,
  isValidMatchResult,
  persistMatchResult,
  readStoredMatchResult,
} from "../result/resultStorage";
import type { MatchResultSnapshot } from "../types/result";
import "./ResultPage.css";

type LocationState = {
  result?: MatchResultSnapshot;
};

export default function ResultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const resultFromState = (location.state as LocationState | null)?.result;
  const result = useMemo(() => {
    if (isValidMatchResult(resultFromState)) {
      persistMatchResult(resultFromState);
      return resultFromState;
    }

    return readStoredMatchResult();
  }, [resultFromState]);

  if (!result) {
    return <Navigate to="/lobby" replace />;
  }

  function handleBackLobby() {
    clearStoredMatchResult();
    navigate("/lobby", { replace: true });
  }

  return (
    <div className="result-page">
      <section className="result-card" aria-live="polite">
        <p className="result-kicker">Match Result</p>
        <h1>房间 {result.roomCode} 结算</h1>
        <p className="result-time">
          结束时间：{new Date(result.endedAt).toLocaleString()}
        </p>

        <div className="result-table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>名次</th>
                <th>玩家</th>
                <th>积分</th>
              </tr>
            </thead>
            <tbody>
              {result.players.map((player) => (
                <tr key={`result-${player.userId}`}>
                  <td>{player.rank}</td>
                  <td>
                    {player.username}
                    {player.userId === user?.id ? "（你）" : ""}
                  </td>
                  <td>{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="result-back-btn" onClick={handleBackLobby}>
          返回大厅
        </button>
      </section>
    </div>
  );
}
