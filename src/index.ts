import { Application } from 'pixi.js';
import { createPlayfield, updatePlayfield, updatePieceTetrix, mergeTetrix } from './game/systems/PLAYFIELD';
import { clearTetrixLines } from './game/systems/COLLISION';
import { GameState } from './game/_GAME_STATE';
import { InputHandler } from './game/_INPUT_HANDLER';
import { Gravity } from './game/systems/GRAVITY';
import { Movement } from './game/systems/MOVEMENT';
import { Rotation } from './game/systems/ROTATION';
import { HardDrop } from './game/systems/HARD_DROP';
import { Hold } from './game/systems/HOLD_PIECE';
import { Ghost } from './game/systems/GHOST_PIECE';

async function prepare(): Promise<Application> {
    const app = new Application();
    await app.init({ background: '#444444', width: 1200, height: 900 });
    document.body.appendChild(app.canvas);
    return app;
}

(async () => {
    const app = await prepare();
    const { container: playfield, cells } = createPlayfield();
    app.stage.addChild(playfield);
    
    const state = new GameState();
    const input = new InputHandler();
    
    app.ticker.add((ticker) => {
        const delta = ticker.deltaMS;
        
        // Update input timers
        input.updateTimers(delta);
        
        // Update game systems
        Gravity.update(state, delta);
        Movement.handleHorizontal(state, input);
        Movement.handleSoftDrop(state, input);
        Rotation.handle(state, input);
        HardDrop.handle(state, input);
        Hold.handle(state, input);
        
        // Clear completed lines
        clearTetrixLines(state.mainTetrix);
        
        // Render
        const ghostTetrix = Ghost.calculate(state);
        const pieceTetrix = updatePieceTetrix(state.piece[state.rotationState], state.coordinates);
        
        const staticTetrix = mergeTetrix(state.mainTetrix, 
            ghostTetrix.map(row => row.map(cell => cell !== 0 ? -1 : 0)));
        const displayTetrix = mergeTetrix(staticTetrix, pieceTetrix);
        
        updatePlayfield(cells, displayTetrix);
    });
})();
