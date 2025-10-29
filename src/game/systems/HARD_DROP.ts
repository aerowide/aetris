import { GameState } from '../_GAME_STATE';
import { InputHandler } from '../_INPUT_HANDLER';
import { CONTROLS } from '../../data/CONTROLS';
import { collisionCheck } from './COLLISION';
import { Gravity } from './GRAVITY';

export class HardDrop {
    static handle(state: GameState, input: InputHandler) {
        if (!input.isKeyPressed(CONTROLS.HD) || input.hardDropped) return;
        
        input.hardDropped = true;
        
        for (let drop = state.coordinates.y; drop < 25; drop++) {
            if (collisionCheck(state.piece[state.rotationState], 
                { x: state.coordinates.x, y: drop }, state.mainTetrix)) {
                state.coordinates.y = drop - 1;
                state.gravityTimer = state.gravity * 1000 + 1;
                state.lockTimer = state.lockDelay + 1;
                break;
            }
        }
    }
}
