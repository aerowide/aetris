import { GameState } from '../_GAME_STATE';
import { InputHandler } from '../_INPUT_HANDLER';
import { CONTROLS } from '../../data/CONTROLS';
import { PARAM } from '../../data/PARAMETERS';
import { collisionCheck } from './COLLISION';

export class Movement {
    static handleHorizontal(state: GameState, input: InputHandler) {
        const direction = input.isKeyPressed(CONTROLS.LEFT) ? -1 : 
                         input.isKeyPressed(CONTROLS.RIGHT) ? 1 : 0;
        
        if (!direction) return;
        
        const dirKey = direction === -1 ? CONTROLS.LEFT : CONTROLS.RIGHT;
        const moveDelay = (input.cellsMoved === 0 ? 0 : 
                          input.cellsMoved === 1 ? PARAM.DAS : PARAM.ARR) * 1000;
        
        if (input.keyTimers[dirKey] > moveDelay) {
            const tryCoords = { x: state.coordinates.x + direction, y: state.coordinates.y };
            if (!collisionCheck(state.piece[state.rotationState], tryCoords, state.mainTetrix)) {
                state.coordinates.x += direction;
                input.cellsMoved++;
                input.keyTimers[dirKey] = 0;
                state.lockTimer = 0; // Reset lock timer on movement
            }
        }
    }
    
    static handleSoftDrop(state: GameState, input: InputHandler) {
        if (!input.isKeyPressed(CONTROLS.SD)) return;
        
        if (PARAM.SDF === Infinity) {
            // Instant drop to bottom
            for (let drop = state.coordinates.y; drop < 25; drop++) {
                if (collisionCheck(state.piece[state.rotationState], 
                    { x: state.coordinates.x, y: drop }, state.mainTetrix)) {
                    state.coordinates.y = drop - 1;
                    state.gravityTimer = 0;
                    break;
                }
            }
        } else {
            // Normal soft drop
            const tryCoords = { x: state.coordinates.x, y: state.coordinates.y + 1 };
            if (!collisionCheck(state.piece[state.rotationState], tryCoords, state.mainTetrix)) {
                state.coordinates.y++;
                input.cellsMoved++;
                state.gravityTimer = 0;
                input.keyTimers[CONTROLS.SD] = 0;
            }
        }
    }
}