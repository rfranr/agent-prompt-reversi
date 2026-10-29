# TASK — Build a Reversi Game

Build a complete, playable **Reversi (Othello)** game using TypeScript.

Deliver a working application, not a design proposal.

You are responsible for the architecture, implementation, project structure, dependencies, and automated tests.

## Technology constraints

- Node.js 24
- TypeScript with strict type checking
- React + Vite for the web interface
- No backend, database, authentication, or external services
- No game engines or third-party Reversi logic libraries
- The application must run locally

## Game rules

Implement standard 8×8 Reversi rules.

### Initial state

- Two players: Black and White.
- Black plays first.
- The four center squares contain the standard initial arrangement:
  - D4 and E5: White
  - E4 and D5: Black
- All other squares are empty.

### Legal moves

- A player may place a disc on an empty square only if it captures at least one opponent disc.
- A capture consists of one or more consecutive opponent discs followed by one of the current player's discs.
- Captures are evaluated in all eight directions.
- A move may capture discs in multiple directions simultaneously.

### Applying moves

- Place the current player's disc.
- Flip every captured opponent disc.
- Do not modify the board when a move is illegal.
- Alternate turns according to the rules below.

### Passing

- If the next player has no legal moves, their turn is automatically passed.
- If neither player has legal moves, the game ends.
- Players cannot voluntarily pass when a legal move exists.

### End of game

- The game ends when neither player can move, including when the board is full.
- The player with the most discs wins.
- Equal disc counts result in a draw.

## User interface

Create a simple, functional interface:

- Display the complete 8×8 board.
- Clearly distinguish Black and White discs.
- Indicate the current player.
- Highlight legal moves.
- Allow a move by clicking a legal square.
- Display each player's disc count.
- Display automatic pass notifications.
- Display the winner or draw when the game ends.
- Include a New Game button.
- Support two human players sharing the same device.
- Provide a usable layout on desktop and mobile.

Prioritize usability over visual effects.

## Quality requirements

- Keep game rules independent of the React UI.
- Use pure functions for game-state calculations and transitions.
- Do not mutate the previous game state.
- Represent invalid moves explicitly and consistently.
- Ensure deterministic behavior.
- Provide automated unit tests for game rules.
- Provide integration tests for essential UI interactions.
- Document installation, execution, and testing in README.md.

## Acceptance criteria

A fresh checkout must support:

1. Installing dependencies using npm.
2. Starting the game with `npm run dev`.
3. Running automated tests with `npm test`.
4. Running TypeScript type checking successfully.
5. Playing a complete two-player game.
6. Correctly capturing discs horizontally, vertically, and diagonally.
7. Rejecting illegal moves without changing the game state.
8. Automatically passing when a player has no legal moves.
9. Ending the game when neither player can move.
10. Restarting a game at any time.

## Delivery

Implement the complete application.

Choose the internal architecture and module boundaries independently.

Do not add AI opponents, multiplayer networking, persistence, authentication, or unrelated features.

Run the relevant checks and report their results.
