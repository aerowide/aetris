import { GameState } from '../_GAME_STATE';
import { collisionCheck } from './COLLISION';
import { updatePieceTetrix, mergeTetrix } from './PLAYFIELD';

export class Gravity {
    static update(state: GameState, delta: number) {
        state.gravityTimer += delta; // MS
        
        if (state.gravityTimer > state.gravity * 1000) {
            const tryCoords = { x: state.coordinates.x, y: state.coordinates.y + 1 };
            
            if (!collisionCheck(state.piece[state.rotationState], tryCoords, state.mainTetrix)) {
                state.coordinates.y++;
                state.lockTimer = 0; // DELAY BETWEEN MOVING DOWN
            } else {
                // START LOCK TIMER (SECONDS!!!!)
                state.lockTimer += delta;
                if (state.lockTimer >= state.lockDelay) {
                    this.lockPiece(state);
                }
            }
            state.gravityTimer = 0;
        }
    }
    // yeah
    static lockPiece(state: GameState) {
        const pieceTetrix = updatePieceTetrix(state.piece[state.rotationState], state.coordinates);
        state.mainTetrix = mergeTetrix(state.mainTetrix, pieceTetrix);
        state.spawnNextPiece();
    }
}
