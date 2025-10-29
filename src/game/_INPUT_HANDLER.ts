import { CONTROLS } from '../data/CONTROLS';

export class InputHandler {
    keys: Record<string, boolean> = {};
    keyTimers: Record<string, number> = {};
    cellsMoved: number = 0;
    
    // Flags for single-press actions
    rotationPressed: boolean = false;
    hardDropped: boolean = false;
    
    constructor() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            if (!(e.code in this.keyTimers)) this.keyTimers[e.code] = 0;
        });
        
        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
            this.keyTimers[e.code] = 0;
            
            // Reset flags on key release
            if (e.code === CONTROLS.CW || e.code === CONTROLS.CCW || e.code === CONTROLS.R180) {
                this.rotationPressed = false;
            }
            if (e.code === CONTROLS.HD) {
                this.hardDropped = false;
            }
            if (e.code === CONTROLS.LEFT || e.code === CONTROLS.RIGHT || e.code === CONTROLS.SD) {
                this.cellsMoved = 0;
            }
        });
    }
    
    updateTimers(delta: number) {
        for (const key in this.keyTimers) {
            if (this.keys[key]) {
                this.keyTimers[key] += delta;
            }
        }
    }
    
    isKeyPressed(key: string): boolean {
        return this.keys[key] || false;
    }
}
