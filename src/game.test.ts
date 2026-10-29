import { describe, expect, it } from 'vitest';
import { applyMove, captures, createGame, discCounts, legalMoves, winner, type Cell, type GameState } from './game';

const empty = (): Cell[][] => Array.from({ length: 8 }, () => Array<Cell>(8).fill(null));
export function passFixture(): GameState {
  const board = Array.from({ length: 8 }, () => Array<Cell>(8).fill('black'));
  board[0]![0] = null; board[0]![1] = 'white';
  board[7]![7] = null; board[7]![6] = 'white';
  return { board, currentPlayer: 'black', status: 'playing', passedPlayer: null };
}

describe('Reversi rules', () => {
  it('starts with the standard arrangement and four black moves', () => {
    const game = createGame();
    expect(game.currentPlayer).toBe('black');
    expect(game.board[3]![3]).toBe('white'); expect(game.board[4]![4]).toBe('white');
    expect(game.board[3]![4]).toBe('black'); expect(game.board[4]![3]).toBe('black');
    expect(discCounts(game.board)).toEqual({ black: 2, white: 2 });
    expect(legalMoves(game.board, 'black')).toEqual([
      { row: 2, col: 3 }, { row: 3, col: 2 }, { row: 4, col: 5 }, { row: 5, col: 4 },
    ]);
  });
  it('captures multiple consecutive discs in all eight directions simultaneously', () => {
    const board = empty();
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      board[3 + dr]![3 + dc] = 'white';
      board[3 + dr * 2]![3 + dc * 2] = 'white';
      board[3 + dr * 3]![3 + dc * 3] = 'black';
    }
    expect(captures(board, 'black', { row: 3, col: 3 })).toHaveLength(16);
    const result = applyMove({ board, currentPlayer: 'black', status: 'playing', passedPlayer: null }, { row: 3, col: 3 });
    expect(result.ok).toBe(true);
    expect(discCounts(result.state.board)).toEqual({ black: 25, white: 0 });
    expect(discCounts(board)).toEqual({ black: 8, white: 16 });
  });
  it('requires an unbroken opponent line terminated by a friendly disc, without wrapping edges', () => {
    const board = empty();
    board[0]![1] = 'white'; board[0]![3] = 'black';
    expect(captures(board, 'black', { row: 0, col: 0 })).toEqual([]);
    board[0]![2] = 'white';
    expect(captures(board, 'black', { row: 0, col: 0 })).toHaveLength(2);
    expect(captures(board, 'white', { row: 0, col: 4 })).toHaveLength(1);
    board[0]![7] = 'white'; board[1]![0] = 'black';
    expect(captures(board, 'black', { row: 0, col: 6 })).toEqual([]);
  });
  it('applies moves immutably and alternates players', () => {
    const game = createGame();
    game.board.forEach(Object.freeze); Object.freeze(game.board); Object.freeze(game);
    const result = applyMove(game, { row: 2, col: 3 });
    expect(result.ok).toBe(true);
    expect(result.state.currentPlayer).toBe('white');
    expect(discCounts(result.state.board)).toEqual({ black: 4, white: 1 });
    expect(discCounts(game.board)).toEqual({ black: 2, white: 2 });
  });
  it.each([
    [-1, 0, 'out-of-bounds'], [8, 0, 'out-of-bounds'], [0.5, 0, 'out-of-bounds'],
    [NaN, 0, 'out-of-bounds'], [3, 3, 'occupied'], [0, 0, 'no-capture'],
  ])('rejects (%s, %s) with %s and the identical state', (row, col, reason) => {
    const game = createGame();
    const result = applyMove(game, { row: Number(row), col: Number(col) });
    expect(result).toEqual({ ok: false, reason, state: game });
    expect(result.state).toBe(game);
  });
  it('automatically passes and then finishes on a full board', () => {
    const first = applyMove(passFixture(), { row: 0, col: 0 });
    expect(first.ok).toBe(true);
    expect(first.state.passedPlayer).toBe('white');
    expect(first.state.currentPlayer).toBe('black');
    expect(first.state.status).toBe('playing');
    const last = applyMove(first.state, { row: 7, col: 7 });
    expect(last.state.status).toBe('finished');
    expect(winner(last.state.board)).toBe('black');
    expect(applyMove(last.state, { row: 0, col: 0 })).toEqual({ ok: false, reason: 'game-over', state: last.state });
  });
  it('ends with empty squares when neither player can move', () => {
    const board = empty(); board[0]![1] = 'white'; board[0]![2] = 'black';
    const result = applyMove({ board, currentPlayer: 'black', status: 'playing', passedPlayer: null }, { row: 0, col: 0 });
    expect(result.state.status).toBe('finished');
    expect(discCounts(result.state.board)).toEqual({ black: 3, white: 0 });
  });
  it('scores white victories and draws', () => {
    const board = empty(); board[0]![0] = 'white';
    expect(winner(board)).toBe('white');
    board[0]![1] = 'black'; expect(winner(board)).toBe('draw');
  });
  it('plays a deterministic complete game with valid transitions', () => {
    let game = createGame(); let turns = 0;
    while (game.status === 'playing') {
      const move = legalMoves(game.board, game.currentPlayer)[0]!;
      const before = discCounts(game.board);
      const result = applyMove(game, move);
      expect(result.ok).toBe(true);
      const after = discCounts(result.state.board);
      expect(after.black + after.white).toBe(before.black + before.white + 1);
      game = result.state;
      expect(++turns).toBeLessThanOrEqual(60);
    }
    expect(legalMoves(game.board, 'black')).toEqual([]);
    expect(legalMoves(game.board, 'white')).toEqual([]);
  });
});
