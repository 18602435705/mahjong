export interface MatchHistoryPlayer {
  userId: number;
  username: string;
  seatIndex: number;
  score: number;
  rank: number;
}

export interface MatchHistoryItem {
  matchId: number;
  roomCode: string;
  endedAt: string;
  mySeatIndex: number;
  myScore: number;
  myRank: number;
  players: MatchHistoryPlayer[];
}
