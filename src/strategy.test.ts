import { expect, it } from 'vitest';
import { applyMove, createGame, legalMoves, type Cell, type GameState } from './game';
import { chooseMove, evaluate, type Difficulty } from './strategy';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
function fixture(): GameState {
  const board = Array.from({ length: 8 }, () => Array<Cell>(8).fill('black'));
  board[0]![0] = null; board[0]![1] = 'white';
  board[7]![7] = null; board[7]![6] = 'white';
  return { board, currentPlayer: 'black', status: 'playing', passedPlayer: null };
}
it.each(difficulties)('%s is legal, deterministic, and immutable', difficulty => {
  const state = applyMove(createGame(), { row: 2, col: 3 }).state;
  const snapshot = structuredClone(state);
  state.board.forEach(Object.freeze); Object.freeze(state.board); Object.freeze(state);
  const move = chooseMove(state, difficulty);
  expect(legalMoves(state.board, state.currentPlayer)).toContainEqual(move);
  expect(chooseMove(state, difficulty)).toEqual(move);
  expect(state).toEqual(snapshot);
});
it.each(difficulties)('%s handles passes and terminal positions', difficulty => {
  const state = fixture();
  expect(chooseMove(state, difficulty)).toEqual({ row: 0, col: 0 });
  const next = applyMove(state, chooseMove(state, difficulty)!).state;
  expect(next.passedPlayer).toBe('white');
  expect(chooseMove({ ...next, currentPlayer: 'white' }, difficulty)).toBeNull();
  const terminal = applyMove(next, chooseMove(next, difficulty)!).state;
  expect(chooseMove(terminal, difficulty)).toBeNull();
  expect(evaluate(terminal, 'black')).toBe(100064);
  expect(evaluate(terminal, 'white')).toBe(-100064);
});
it.each(difficulties)('%s completes a game without illegal transitions', difficulty => {
  let state = createGame();
  let turns = 0;
  while (state.status === 'playing') {
    const move = state.currentPlayer === 'white' ? chooseMove(state, difficulty) : legalMoves(state.board, 'black')[0];
    expect(move).toBeTruthy();
    const result = applyMove(state, move!);
    expect(result.ok).toBe(true);
    state = result.state;
    expect(++turns).toBeLessThanOrEqual(60);
  }
  expect(legalMoves(state.board, 'black')).toHaveLength(0);
  expect(legalMoves(state.board, 'white')).toHaveLength(0);
}, 30000);
it('scores terminal draws and detects no-move endings with empty squares', () => {
  expect(evaluate({ ...createGame(), status: 'finished' }, 'white')).toBe(0);
  const board = Array.from({ length: 8 }, () => Array<Cell>(8).fill(null));
  board[0]![0] = 'white';
  expect(evaluate({ board, currentPlayer: 'black', status: 'playing', passedPlayer: null }, 'white')).toBe(100001);
});
it.each(difficulties)('%s prefers a corner over a non-corner alternative', difficulty => {
  const board = createGame().board.map(row => [...row]);
  board[0]![1] = 'black'; board[0]![2] = 'white';
  const state: GameState = { board, currentPlayer: 'white', status: 'playing', passedPlayer: null };
  expect(legalMoves(board, 'white').length).toBeGreaterThan(1);
  expect(chooseMove(state, difficulty)).toEqual({ row: 0, col: 0 });
});
