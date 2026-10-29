import { applyMove, discCounts, legalMoves, opponent, type GameState, type Player, type Position } from './game';

export type Difficulty = 'easy' | 'medium' | 'hard';
export const depths: Record<Difficulty, number> = { easy: 1, medium: 3, hard: 5 };
const weights = [
  [120, -25, 20, 5, 5, 20, -25, 120],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [120, -25, 20, 5, 5, 20, -25, 120],
];

/** Score from perspective's viewpoint; terminal wins dominate every heuristic score. */
export function evaluate(state: GameState, perspective: Player): number {
  const other = opponent(perspective);
  const counts = discCounts(state.board);
  const difference = counts[perspective] - counts[other];
  const ownMoves = legalMoves(state.board, perspective).length;
  const otherMoves = legalMoves(state.board, other).length;
  if (state.status === 'finished' || (!ownMoves && !otherMoves)) {
    return difference === 0 ? 0 : Math.sign(difference) * 100000 + difference;
  }
  let positional = 0;
  let corners = 0;
  state.board.forEach((row, r) => row.forEach((cell, c) => {
    const sign = cell === perspective ? 1 : cell === other ? -1 : 0;
    positional += sign * weights[r]![c]!;
    if ((r === 0 || r === 7) && (c === 0 || c === 7)) corners += sign;
  }));
  return difference + 8 * (ownMoves - otherMoves) + 100 * corners + positional;
}

function search(state: GameState, depth: number, perspective: Player, alpha: number, beta: number): number {
  const moves = legalMoves(state.board, state.currentPlayer);
  if (state.status === 'finished') return evaluate(state, perspective);
  if (!moves.length) {
    const next = opponent(state.currentPlayer);
    if (!legalMoves(state.board, next).length) return evaluate(state, perspective);
    // A pass consumes no placement depth. applyMove normally handles these for us.
    return search({ ...state, currentPlayer: next, passedPlayer: state.currentPlayer }, depth, perspective, alpha, beta);
  }
  if (depth === 0) return evaluate(state, perspective);
  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const result = applyMove(state, move);
    if (!result.ok) continue;
    const value = search(result.state, depth - 1, perspective, alpha, beta);
    best = maximizing ? Math.max(best, value) : Math.min(best, value);
    if (maximizing) alpha = Math.max(alpha, best);
    else beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

/**
 * Pure immutable minimax selection for state.currentPlayer, with alpha-beta pruning.
 * Depth counts placements (Easy 1, Medium 3, Hard 5); passes do not consume depth.
 * Returns null for finished games or when the current player must pass.
 * Equal scores select the first legal square in row-major order, deterministically.
 */
export function chooseMove(state: GameState, difficulty: Difficulty): Position | null {
  if (state.status === 'finished') return null;
  let best: Position | null = null;
  let score = -Infinity;
  for (const move of legalMoves(state.board, state.currentPlayer)) {
    const result = applyMove(state, move);
    if (!result.ok) continue;
    const value = search(result.state, depths[difficulty] - 1, state.currentPlayer, score, Infinity);
    if (value > score) { score = value; best = move; }
  }
  return best;
}
