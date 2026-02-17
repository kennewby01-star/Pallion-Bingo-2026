
export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface BingoState {
  allNumbers: number[];
  drawnNumbers: number[];
  currentNumber: number | null;
  remainingNumbers: number[];
}
