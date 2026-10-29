import { chooseMove, type Difficulty } from './strategy';
import type { GameState } from './game';

self.onmessage = (event: MessageEvent<{ state: GameState; difficulty: Difficulty }>) => {
  self.postMessage(chooseMove(event.data.state, event.data.difficulty));
};
