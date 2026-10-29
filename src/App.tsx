import { useEffect, useState } from 'react';
import type { Difficulty } from './strategy';
import type { Position } from './game';
import { applyMove, createGame, discCounts, legalMoves, winner, type GameState } from './game';
import './style.css';

const name = (player: string) => player[0]!.toUpperCase() + player.slice(1);

export default function App({ initialState }: { initialState?: GameState }) {
  const [game, setGame] = useState<GameState>(() => initialState ?? createGame());
  const [mode, setMode] = useState('human');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [error, setError] = useState('');
  const thinking = mode === 'computer' && game.status === 'playing' && game.currentPlayer === 'white';
  useEffect(() => {
    if (!thinking) return;
    const worker = new Worker(new URL('./computer.worker.ts', import.meta.url), { type: 'module' });
    let active = true;
    worker.onmessage = (event: MessageEvent<Position | null>) => {
      if (!active) return;
      active = false;
      worker.terminate();
      if (event.data) setGame(previous => previous === game ? applyMove(previous, event.data!).state : previous);
    };
    worker.onerror = () => {
      if (active) setError('Computer calculation failed. Start a new game to retry.');
      worker.terminate();
    };
    worker.postMessage({ state: game, difficulty });
    return () => { active = false; worker.terminate(); };
  }, [game, thinking, difficulty]);
  function restart() { setError(''); setGame(createGame()); }
  const counts = discCounts(game.board);
  const moves = game.status === 'playing' ? legalMoves(game.board, game.currentPlayer) : [];
  const outcome = game.status === 'finished' ? winner(game.board) : null;
  function move(row: number, col: number) {
    if (thinking) return;
    setGame(previous => {
      const result = applyMove(previous, { row, col });
      return result.state;
    });
  }
  return <main>
    <header><div><p className="eyebrow">TWO COLORS · ONE BOARD</p><h1>Reversi</h1></div>
      <button className="restart" onClick={restart}>New Game</button>
    </header>
    <section className="settings" aria-label="Game settings">
      <label>Game mode <select value={mode} onChange={event => { setMode(event.target.value); restart(); }}>
        <option value="human">Human vs Human</option><option value="computer">Human vs Computer</option>
      </select></label>
      {mode === 'computer' && <label>Difficulty <select value={difficulty} onChange={event => { setDifficulty(event.target.value as Difficulty); restart(); }}>
        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
      </select></label>}
      <small>Changing settings starts a new game. In computer mode, you play Black.</small>
    </section>
    <section className="scores" aria-label="Disc counts">
      {(['black', 'white'] as const).map(player => <div key={player} className={`score ${game.status === 'playing' && game.currentPlayer === player ? 'active' : ''}`}>
        <span className={`disc ${player}`} aria-hidden="true" />
        <span>{name(player)}</span><strong aria-label={`${name(player)} discs`}>{counts[player]}</strong>
      </div>)}
    </section>
    <div className="status" role="status" aria-live="polite" aria-atomic="true">
      <strong>{outcome ? outcome === 'draw' ? 'Game over — draw!' : `Game over — ${name(outcome)} wins!` : `${name(game.currentPlayer)} to move`}</strong>
      <span>{game.passedPlayer ? `${name(game.passedPlayer)} has no legal moves and passes. ` : ''}{error || (thinking ? 'Computer is thinking…' : game.status === 'playing' ? 'Choose a highlighted square.' : 'Start a new game to play again.')}</span>
    </div>
    <div className="board" role="group" aria-label="Reversi board">
      {game.board.flatMap((row, r) => row.map((cell, c) => {
        const legal = moves.some(position => position.row === r && position.col === c);
        const coordinate = `${String.fromCharCode(65 + c)}${r + 1}`;
        return <button key={coordinate} className={`square ${legal ? 'legal' : ''}`}
          aria-label={`${coordinate}: ${cell ? name(cell) : legal ? 'legal move' : 'empty'}`}
          disabled={!legal || thinking} onClick={() => move(r, c)}>
          <span className="coordinate" aria-hidden="true">{coordinate}</span>
          {cell ? <span className={`disc ${cell}`} aria-hidden="true" /> : legal ? <span className="hint" aria-hidden="true" /> : null}
        </button>;
      }))}
    </div>
    <p className="help">Black moves first. Place a disc to trap and flip your opponent’s discs in any direction. No moves? Your turn passes automatically. Most discs wins.</p>
  </main>;
}
