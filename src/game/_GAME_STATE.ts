import { TETROMINOS } from '../data/PIECES';
import { shuffleArray } from '../utils/UTILS';
import { emptyMatrix } from '../utils/UTILS';

type Mino = keyof typeof TETROMINOS;
const pieces: Mino[] = ['o', 't', 'l', 'j', 's', 'z', 'i'];

export class GameState {
    // Board state
    mainTetrix: number[][];
    coordinates: { x: number; y: number };
    
    // Piece state
    queue: Mino[];
    queueNumber: number;
    piece: number[][][];
    rotationState: number;
    heldPiece: Mino | null;
    canHold: boolean;
    
    // Timers
    gravityTimer: number;
    lockTimer: number;
    
    // Game config
    gravity: number;
    lockDelay: number;
    linesCleared: number;
    
    constructor() {
        this.mainTetrix = emptyMatrix();
        this.coordinates = { x: 4, y: 0 };
        
        this.queue = shuffleArray(pieces).concat(shuffleArray(pieces));
        this.queueNumber = 0;
        this.piece = TETROMINOS[this.queue[0]];
        this.rotationState = 0;
        this.heldPiece = null;
        this.canHold = true;
        
        this.gravityTimer = 0;
        this.lockTimer = 0;
        this.gravity = 1.000;
        this.lockDelay = 1.000; // 1000MS
        this.linesCleared = 0;
    }
    
    spawnNextPiece() {
        this.queueNumber++;
        if (this.queueNumber >= 7) {
            this.queue = this.queue.slice(7).concat(shuffleArray(pieces));
            this.queueNumber = 0;
        }
        this.piece = TETROMINOS[this.queue[this.queueNumber]];
        this.rotationState = 0;
        this.coordinates = { x: 4, y: 0 };
        this.canHold = true;
        this.lockTimer = 0;
    }
    
    getCurrentPieceType(): Mino {
        return this.queue[this.queueNumber];
    }
}