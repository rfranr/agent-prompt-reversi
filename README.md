# Reversi

A local Reversi game supporting Human vs Human and Human vs Computer. Requires Node.js 24 and npm. No backend or external services.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Checks

```sh
npm test              # Rules and React integration tests (Vitest + jsdom)
npm run typecheck    # Strict TypeScript checking
npm run build        # Type check and production build into dist/
```

`npm ci` can be used for reproducible installation from the included lockfile.

## Play

Select **Human vs Human** for local two-player play, or **Human vs Computer** to play Black against the computer (White). Choose **Easy** (depth 1), **Medium** (depth 3), or **Hard** (depth 5). Changing mode or difficulty starts a new game; **New Game** restarts with the selected settings.

The deterministic computer uses minimax with alpha-beta pruning, disc difference, mobility, corners, and positional weights. Equal scores use row-major square order. Calculations run in a Web Worker so the interface stays responsive. Human moves are disabled during computer turns; restarting terminates the worker and discards stale results.

Black starts. Click a highlighted square to place a disc and flip all bracketed opponent discs horizontally, vertically, or diagonally. The counts and current turn appear above the board. A player without legal moves automatically passes; the status message announces this. When neither player can move, the higher count wins (equal counts draw). **New Game** resets at any time.

The responsive board supports mouse, touch, and keyboard: Tab to a legal square, then Enter or Space. Squares have coordinate and content labels for assistive technology; turn, pass, and result messages use a live status region.

## Structure

- `src/game.ts`: framework-independent, deterministic rules and immutable transitions. `applyMove` returns a discriminated result; invalid moves include a reason and the unchanged original state. Board coordinates are zero-based row/column; the UI labels them A1–H8.
- `src/strategy.ts`: pure immutable `chooseMove(state, difficulty)` strategy; returns a legal position for the current player, or null on a pass or finished game. Search counts placements, not passes, and uses the existing rules for transitions.
- `src/computer.worker.ts`: off-main-thread strategy execution.
- `src/App.tsx`: board, scores, announcements, settings, and cancellable computer lifecycle.
- `src/strategy.test.ts` and `src/computer.test.tsx`: legal/deterministic/immutable decisions, all difficulties, passes, terminal scores, corner preference, complete games, blocked human input, and stale-decision invalidation.
- `src/game.test.ts`: initialization, all capture directions, illegal moves, immutability, passing, scoring, and full-game simulation.
- `src/App.test.tsx`: click and keyboard play, counts, restart, pass, and end-game announcements. Tests run in jsdom, not a real browser.

No external AI services, networking, or persistence are included.

For manual verification, run `npm run dev`, play both modes, try each difficulty, and restart or switch modes while “Computer is thinking…” is visible. Verify the fresh board remains unchanged by the old decision and that controls remain responsive.
