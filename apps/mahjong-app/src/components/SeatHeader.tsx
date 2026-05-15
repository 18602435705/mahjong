type SeatHeaderProps = {
  title: string;
  score: number;
  online?: boolean;
};

/**
 * 渲染座位头部：玩家名、积分，以及可选的手牌张数。
 */
function SeatHeader({ title, score, online }: SeatHeaderProps) {
  return (
    <header className="seat-header">
      <div className="seat-header-title-wrap">
        <strong className="seat-header-title">{title}</strong>
        {typeof online === "boolean" ? (
          <span className={`seat-presence ${online ? "online" : "offline"}`}>
            {online ? "在线" : "离线"}
          </span>
        ) : null}
      </div>
      <span className="seat-header-score">积分：{score}</span>
    </header>
  );
}

export default SeatHeader;
