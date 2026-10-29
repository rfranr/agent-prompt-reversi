import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import App from './App';
import { createGame, type Cell, type GameState } from './game';

it('shows the board, highlights legal moves, flips discs and restarts', async () => {
  const user = userEvent.setup();
  render(<App />);
  const board = screen.getByRole('group', { name: 'Reversi board' });
  expect(within(board).getAllByRole('button')).toHaveLength(64);
  expect(within(board).getAllByRole('button', { name: /legal move/ })).toHaveLength(4);
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
  expect(screen.getByRole('button', { name: 'A1: empty' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'A1: empty' }));
  expect(screen.getByLabelText('Black discs')).toHaveTextContent('2');
  await user.click(screen.getByRole('button', { name: 'D3: legal move' }));
  expect(screen.getByRole('button', { name: 'D4: Black' })).toBeDisabled();
  expect(screen.getByLabelText('Black discs')).toHaveTextContent('4');
  expect(screen.getByLabelText('White discs')).toHaveTextContent('1');
  expect(screen.getByRole('status')).toHaveTextContent('White to move');
  await user.click(screen.getByRole('button', { name: 'New Game' }));
  expect(screen.getByLabelText('Black discs')).toHaveTextContent('2');
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
});

it('announces an automatic pass, a winner, and allows restarting after game over', async () => {
  const user = userEvent.setup();
  const board = Array.from({ length: 8 }, () => Array<Cell>(8).fill('black'));
  board[0]![0] = null; board[0]![1] = 'white';
  board[7]![7] = null; board[7]![6] = 'white';
  const initialState: GameState = { board, currentPlayer: 'black', status: 'playing', passedPlayer: null };
  render(<App initialState={initialState} />);
  await user.click(screen.getByRole('button', { name: 'A1: legal move' }));
  expect(screen.getByRole('status')).toHaveTextContent('White has no legal moves and passes.');
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
  await user.click(screen.getByRole('button', { name: 'H8: legal move' }));
  expect(screen.getByRole('status')).toHaveTextContent('Game over — Black wins!');
  expect(screen.getByLabelText('Black discs')).toHaveTextContent('64');
  expect(screen.queryAllByRole('button', { name: /legal move/ })).toHaveLength(0);
  await user.click(screen.getByRole('button', { name: 'New Game' }));
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
});

it('displays a draw', () => {
  render(<App initialState={{ ...createGame(), status: 'finished' }} />);
  expect(screen.getByRole('status')).toHaveTextContent('Game over — draw!');
});

it('supports keyboard activation of a legal move', async () => {
  const user = userEvent.setup();
  render(<App />);
  screen.getByRole('button', { name: 'D3: legal move' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status')).toHaveTextContent('White to move');
});
