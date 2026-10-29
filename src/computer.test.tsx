import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import { chooseMove } from './strategy';
import type { Difficulty } from './strategy';
import type { GameState, Position } from './game';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: { data: Position | null }) => void) | null = null;
  request!: { state: GameState; difficulty: Difficulty };
  terminate = vi.fn();
  constructor() { FakeWorker.instances.push(this); }
  postMessage(request: typeof this.request) { this.request = request; }
  reply() { this.onmessage?.({ data: chooseMove(this.request.state, this.request.difficulty) }); }
}
beforeEach(() => { FakeWorker.instances = []; vi.stubGlobal('Worker', FakeWorker); });
afterEach(() => vi.unstubAllGlobals());

it('runs one computer decision, blocks human input, and resumes human play', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(screen.getByLabelText('Game mode'), 'computer');
  await user.selectOptions(screen.getByLabelText('Difficulty'), 'easy');
  await user.click(screen.getByRole('button', { name: 'D3: legal move' }));
  expect(screen.getByRole('status')).toHaveTextContent('Computer is thinking');
  screen.getAllByRole('button', { name: /legal move/ }).forEach(button => expect(button).toBeDisabled());
  expect(FakeWorker.instances).toHaveLength(1);
  const worker = FakeWorker.instances[0]!;
  expect(worker.request.difficulty).toBe('easy');
  act(() => worker.reply());
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
  expect(screen.getByRole('status')).not.toHaveTextContent('thinking');
  expect(worker.terminate).toHaveBeenCalled();
});

it('terminates and ignores a stale decision after restarting or changing mode', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(screen.getByLabelText('Game mode'), 'computer');
  await user.click(screen.getByRole('button', { name: 'D3: legal move' }));
  const old = FakeWorker.instances[0]!;
  await user.click(screen.getByRole('button', { name: 'New Game' }));
  expect(old.terminate).toHaveBeenCalled();
  act(() => old.reply());
  expect(screen.getByLabelText('Black discs')).toHaveTextContent('2');
  expect(screen.getByLabelText('White discs')).toHaveTextContent('2');
  await user.click(screen.getByRole('button', { name: 'D3: legal move' }));
  const next = FakeWorker.instances[1]!;
  await user.selectOptions(screen.getByLabelText('Game mode'), 'human');
  act(() => next.reply());
  expect(next.terminate).toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Black to move');
  expect(screen.queryByLabelText('Difficulty')).not.toBeInTheDocument();
});
