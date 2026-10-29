export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = readonly (readonly Cell[])[];
export interface Position { readonly row: number; readonly col: number }
export interface GameState {
  readonly board: Board;
  readonly currentPlayer: Player;
  readonly status: 'playing' | 'finished';
  readonly passedPlayer: Player | null;
}
export type MoveResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: 'game-over' | 'out-of-bounds' | 'occupied' | 'no-capture'; readonly state: GameState };

export const opponent = (player: Player): Player => player === 'black' ? 'white' : 'black';
const inside = (row: number, col: number): boolean =>
  Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < 8 && col >= 0 && col < 8;

export function createGame(): GameState {
  const board: Cell[][] = Array.from({ length: 8 }, () => Array<Cell>(8).fill(null));
  board[3]![3] = 'white'; board[4]![4] = 'white';
  board[3]![4] = 'black'; board[4]![3] = 'black';
  return { board, currentPlayer: 'black', status: 'playing', passedPlayer: null };
}

export function captures(board: Board, player: Player, { row, col }: Position): Position[] {
  if (!inside(row, col) || board[row]![col] !== null) return [];
  const result: Position[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const line: Position[] = [];
      let r = row + dr; let c = col + dc;
      while (inside(r, c) && board[r]![c] === opponent(player)) {
        line.push({ row: r, col: c }); r += dr; c += dc;
      }
      if (line.length > 0 && inside(r, c) && board[r]![c] === player) result.push(...line);
    }
  }
  return result;
}

export function legalMoves(board: Board, player: Player): Position[] {
  const moves: Position[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (captures(board, player, { row, col }).length) moves.push({ row, col });
    }
  }
  return moves;
}

export function discCounts(board: Board): Record<Player, number> {
  const counts = { black: 0, white: 0 };
  for (const row of board) for (const cell of row) if (cell) counts[cell]++;
  return counts;
}

export function winner(board: Board): Player | 'draw' {
  const counts = discCounts(board);
  return counts.black === counts.white ? 'draw' : counts.black > counts.white ? 'black' : 'white';
}

export function applyMove(state: GameState, position: Position): MoveResult {
  const invalid = (reason: Extract<MoveResult, { ok: false }>['reason']): MoveResult => ({ ok: false, reason, state });
  if (state.status === 'finished') return invalid('game-over');
  if (!inside(position.row, position.col)) return invalid('out-of-bounds');
  if (state.board[position.row]![position.col] !== null) return invalid('occupied');
  const flips = captures(state.board, state.currentPlayer, position);
  if (!flips.length) return invalid('no-capture');
  const board = state.board.map(row => [...row]);
  for (const { row, col } of [position, ...flips]) board[row]![col] = state.currentPlayer;
  const next = opponent(state.currentPlayer);
  const nextCanMove = legalMoves(board, next).length > 0;
  const finished = !nextCanMove && legalMoves(board, state.currentPlayer).length === 0;
  return { ok: true, state: {
    board, currentPlayer: nextCanMove ? next : state.currentPlayer,
    status: finished ? 'finished' : 'playing',
    passedPlayer: !nextCanMove && !finished ? next : null,
  } };
}
