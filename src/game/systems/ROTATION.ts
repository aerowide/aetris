import { GameState } from '../_GAME_STATE';
import { InputHandler } from '../_INPUT_HANDLER';
import { CONTROLS } from '../../data/CONTROLS';
import { rotate } from '../../utils/UTILS';
import { TRANSITION, KICKS } from '../../data/KICKTABLE';
import { collisionCheck } from './COLLISION';

export class Rotation {
    static handle(state: GameState, input: InputHandler) {
        const rotation = input.isKeyPressed(CONTROLS.CW) ? 1 : 
                        input.isKeyPressed(CONTROLS.CCW) ? -1 : 
                        input.isKeyPressed(CONTROLS.R180) ? 2 : 0;
        
        if (rotation === 0 || input.rotationPressed) return;
        
        input.rotationPressed = true;
        state.lockTimer = 0; // Reset lock timer on rotation
        
        const preRotation = state.rotationState;
        const postRotation = rotate(state.rotationState, rotation);
        
        // Try rotation without kicks first
        if (!collisionCheck(state.piece[postRotation], state.coordinates, state.mainTetrix)) {
            state.rotationState = postRotation;
            return;
        }
        
        // Try kicks
        const transition = TRANSITION(preRotation, postRotation);
        const kicks = KICKS(state.getCurrentPieceType());
        
        for (const [offsetX, offsetY] of kicks[transition]) {
            const tryCoords = {
                x: state.coordinates.x + offsetX,
                y: state.coordinates.y + offsetY
            };
            
            if (!collisionCheck(state.piece[postRotation], tryCoords, state.mainTetrix)) {
                state.coordinates.x = tryCoords.x;
                state.coordinates.y = tryCoords.y;
                state.rotationState = postRotation;
                break;
            }
        }
    }
}