import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatchHistoryApi } from "../api/history";
import type { MatchHistoryItem } from "../types/history";
import "./HistoryPage.css";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MatchHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      setIsLoading(true);
      setFeedback("");

      try {
        const response = await getMatchHistoryApi({ limit: PAGE_SIZE });
        if (isCancelled) {
          return;
        }
        setItems(response.items);
        setNextCursor(response.nextCursor);
      } catch (error) {
        if (isCancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "加载历史对局失败";
        setFeedback(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleLoadMore() {
    if (nextCursor === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setFeedback("");

    try {
      const response = await getMatchHistoryApi({
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setItems((current) => [...current, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载更多失败";
      setFeedback(message);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="history-page">
      <section className="history-card" aria-live="polite">
        <header className="history-header">
          <div>
            <p className="history-kicker">Match History</p>
            <h1>历史对局</h1>
          </div>
          <button
            type="button"
            className="history-back-btn"
            onClick={() => navigate("/lobby", { replace: true })}
          >
            返回大厅
          </button>
        </header>

        {isLoading ? <p className="history-muted">加载中...</p> : null}

        {!isLoading && items.length === 0 ? (
          <p className="history-muted">暂无历史对局记录</p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>结束时间</th>
                  <th>房间号</th>
                  <th>名次</th>
                  <th>积分</th>
                  <th>座位</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`history-${item.matchId}`}>
                    <td>{new Date(item.endedAt).toLocaleString()}</td>
                    <td>{item.roomCode}</td>
                    <td>{item.myRank}</td>
                    <td>{item.myScore}</td>
                    <td>{item.mySeatIndex + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && nextCursor !== null ? (
          <button
            type="button"
            className="history-load-more-btn"
            disabled={isLoadingMore}
            onClick={() => void handleLoadMore()}
          >
            {isLoadingMore ? "加载中..." : "加载更多"}
          </button>
        ) : null}

        {feedback ? <p className="history-feedback">{feedback}</p> : null}
      </section>
    </div>
  );
}
