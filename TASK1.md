# TASK1 — Reversi Computer Opponent

Extend the existing Reversi application to support playing against the computer.

Deliver working code, automated tests, and an updated user interface. Do not produce a design proposal.

## 1. Game modes

Support two game modes:

- **Human vs Human:** preserve the existing two-player experience.
- **Human vs Computer:** one human plays against the computer.

The human plays Black and moves first. The computer plays White.

Allow users to select the game mode before starting or restarting a game.

## 2. Computer opponent

Implement a deterministic computer opponent using **Minimax with alpha-beta pruning**.

Provide three difficulty levels:

- **Easy:** search depth 1.
- **Medium:** search depth 3.
- **Hard:** search depth 5.

Use a deterministic evaluation function considering at least:

- Disc difference.
- Mobility (available legal moves).
- Corner ownership.
- Positional value of squares.

Use deterministic tie-breaking so identical board states and settings always produce the same move.

Do not use random decisions, external AI services, pretrained models, or third-party game-playing libraries.

## 3. Rules and turn handling

- Reuse the existing game rules and legal-move calculations.
- The computer must never make an illegal move.
- Correctly handle passes during both normal play and Minimax search.
- End the game when neither player has a legal move.
- Prevent human moves while the computer is thinking.
- Never allow two computer moves to execute concurrently.
- Starting a new game must discard any pending computer decision.

## 4. User interface

- Provide a game-mode selector.
- Provide a difficulty selector for Human vs Computer mode.
- Display whose turn it is.
- Show a clear indication while the computer is thinking.
- Preserve disc counts, legal-move highlights, pass notifications, and game results.
- Keep the interface responsive during computer calculations.

## 5. Architecture and constraints

- Node.js 24, TypeScript strict mode, React and Vite.
- Keep the computer strategy independent of React components.
- Expose a pure, deterministic move-selection function with a clearly documented TypeScript contract.
- The strategy must not mutate the provided game state.
- Keep the existing game rules as the single source of truth.
- Do not add backend services, databases, networking, or unrelated features.
- Preserve Human vs Human behavior.
- Avoid unrelated refactoring.

## 6. Automated tests

Include tests covering:

- The computer always chooses a legal move.
- Deterministic results for identical inputs.
- No mutation of input state.
- Correct pass handling during search.
- Correct terminal-state evaluation.
- Preference for an available corner in a suitable test position.
- All three difficulty levels.
- Cancellation or invalidation of pending decisions when starting a new game.
- Human vs Human regression tests.

## 7. Acceptance criteria

A fresh checkout must support:

1. `npm install`
2. `npm run dev`
3. `npm test`
4. Successful TypeScript type checking.
5. Playing Human vs Human.
6. Playing Human vs Computer at all three difficulty levels.
7. Completing games without illegal moves or broken turn handling.
8. Restarting safely during the computer's turn.
9. A responsive user interface during computer calculations.

Update `README.md` with game modes, difficulty levels, and verification instructions.

Implement, run the checks, and report the results.