import { GameState } from '../_GAME_STATE';
import { collisionCheck } from './COLLISION';
import { updatePieceTetrix } from './PLAYFIELD';

export class Ghost {
    static calculate(state: GameState): number[][] {
        let ghostY = 24;
        
        for (let drop = state.coordinates.y; drop < 25; drop++) {
            if (collisionCheck(state.piece[state.rotationState], 
                { x: state.coordinates.x, y: drop }, state.mainTetrix)) {
                ghostY = drop - 1;
                break;
            }
        }
        
        return updatePieceTetrix(state.piece[state.rotationState], 
            { x: state.coordinates.x, y: ghostY });
    }
}