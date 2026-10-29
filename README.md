# Reversi

A local, two-human-player Reversi game. Requires Node.js 24 and npm. No backend or external services.

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

Black starts. Click a highlighted square to place a disc and flip all bracketed opponent discs horizontally, vertically, or diagonally. The counts and current turn appear above the board. A player without legal moves automatically passes; the status message announces this. When neither player can move, the higher count wins (equal counts draw). **New Game** resets at any time.

The responsive board supports mouse, touch, and keyboard: Tab to a legal square, then Enter or Space. Squares have coordinate and content labels for assistive technology; turn, pass, and result messages use a live status region.

## Structure

- `src/game.ts`: framework-independent, deterministic rules and immutable transitions. `applyMove` returns a discriminated result; invalid moves include a reason and the unchanged original state. Board coordinates are zero-based row/column; the UI labels them A1–H8.
- `src/App.tsx`: board, scores, announcements, and restart controls.
- `src/game.test.ts`: initialization, all capture directions, illegal moves, immutability, passing, scoring, and full-game simulation.
- `src/App.test.tsx`: click and keyboard play, counts, restart, pass, and end-game announcements. Tests run in jsdom, not a real browser.

No AI, networking, or persistence is included.
