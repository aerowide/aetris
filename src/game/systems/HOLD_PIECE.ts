import { GameState } from '../_GAME_STATE';
import { InputHandler } from '../_INPUT_HANDLER';
import { CONTROLS } from '../../data/CONTROLS';
import { TETROMINOS } from '../../data/PIECES';

export class Hold {
    static handle(state: GameState, input: InputHandler) {
        if (!input.isKeyPressed(CONTROLS.HOLD) || !state.canHold) return;
        
        if (state.heldPiece === null) {
            state.heldPiece = state.getCurrentPieceType();
            state.spawnNextPiece();
        } else {
            const swap = state.heldPiece;
            state.heldPiece = state.getCurrentPieceType();
            state.queue[state.queueNumber] = swap;
            state.piece = TETROMINOS[swap];
            state.rotationState = 0;
            state.coordinates = { x: 4, y: 0 };
        }
        
        state.canHold = false;
        input.keys[CONTROLS.HOLD] = false;
    }
}
