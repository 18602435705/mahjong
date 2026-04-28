export interface MatchResultPlayer {
  seatIndex: number;
  userId: number;
  username: string;
  score: number;
  rank: number;
}

export interface MatchResultSnapshot {
  roomCode: string;
  endedAt: string;
  players: MatchResultPlayer[];
}
