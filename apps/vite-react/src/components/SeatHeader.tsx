type SeatHeaderProps = {
  title: string;
  score: number;
  handCount?: number;
};

/**
 * 渲染座位头部：玩家名、积分，以及可选的手牌张数。
 */
function SeatHeader({ title, score, handCount }: SeatHeaderProps) {
  return (
    <header className="seat-header">
      <strong>{title}</strong>
      <span>积分：{score}</span>
      {typeof handCount === "number" && <span>手牌：{handCount} 张</span>}
    </header>
  );
}

export default SeatHeader;
