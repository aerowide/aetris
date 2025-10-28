import { Application, Graphics, Container } from 'pixi.js';
import { COLORS } from './data/COLORS'
import { TETROMINOS } from './data/PIECES'
import { CONTROLS } from './data/CONTROLS'
import { PARAM } from './data/PARAMETERS'
import { shuffleArray } from './HELPERS'
import { TRANSITION, KICKS } from './data/KICKTABLE'
type Mino = keyof typeof TETROMINOS;

const [boardWidth, boardHeight, cellSize]: number[] = [10, 25, 20];
const emptyRow = Array(boardWidth).fill(0)

const pieces: Mino[] = ['o', 't', 'l', 'j', 's', 'z', 'i'];

async function prepare(): Promise<Application> {
    const app = new Application();
    await app.init({ background: '#444444', width: 1200, height: 900 });
    document.body.appendChild(app.canvas);
    return app;
}
function emptyMatrix() {
    return (Array(boardHeight).fill(0)).map(() => Array(boardWidth).fill(0))
}
function rotate(curr: number, x: number) {
    return (curr + x + 4) % 4 // BASE-4 NUMBER, overflows/underflows :3
}
function createPlayfield() {
    const container = new Container()
    const cells: Graphics[][] = [];
    
    for (let y = 0; y < boardHeight; y++) {
        cells[y] = [];
        for (let x = 0; x < boardWidth; x++) {
            const cell = new Graphics()
            cell.rect(x*cellSize, y*cellSize, cellSize, cellSize)
                .fill(COLORS.empty);
            container.addChild(cell);
            cells[y][x] = cell;
        }
    }
    return { container, cells };
}
function updatePlayfield(cells: Graphics[][], board: number[][]) {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const colorKey = board[y][x] !== 0 ? 
                String(board[y][x]) : 'empty';
            cells[y][x].clear()
                .rect(x*cellSize, y*cellSize, cellSize, cellSize)
                .fill(COLORS[colorKey as keyof typeof COLORS]);
        }
    }
}
function updatePieceTetrix(piece: number[][], coords: {[key: string]: number}) {
    const pieceTetrix = emptyMatrix();
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const [X, Y] = [coords.x + x, coords.y + y]
                if (X >= 0 && X < boardWidth && Y >= 0 && Y < boardHeight) {
                    pieceTetrix[Y][X] = piece[y][x]
                }
            }
        }
    } return pieceTetrix;
}
function collisionCheck(piece: number[][], coords: {[key: string]: number}, mainTetrix: number[][]): boolean {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const [X, Y] = [coords.x + x, coords.y + y];

                if (X < 0 || X >= boardWidth || Y < 0 || Y >= boardHeight) {
                    return true;
                }
                if (mainTetrix[Y][X] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}
function mergeTetrix(mainTetrix: number[][], pieceTetrix: number[][]) {
    const result = mainTetrix.map(row => [...row]); // Deep copy
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (pieceTetrix[y][x] !== 0) {
                result[y][x] = pieceTetrix[y][x];
            }
        }
    }
    return result;
}
function clearLines(mainTetrix: number[][]) {
    for (let y = boardHeight - 1; y >= 0; y--) {
        if (mainTetrix[y].every(cell => cell !== 0)) {
            mainTetrix.splice(y, 1);
            mainTetrix.unshift([...emptyRow]);
            y++;
        }
    }
}

(async () => {
    const app = await prepare()
    const { container: Playfield, cells } = createPlayfield()
    app.stage.addChild(Playfield); // ADD PLAYFIELD TO uhhhh yea

    let [queue, queueNumber]: [Mino[], number] = [shuffleArray(pieces).concat(shuffleArray(pieces)), 0]; // 7-BAG QUEUE
    let coordinates: {[key: string]: number} = {x: Math.floor(boardWidth / 2)-1, y: 0}; // COORDINATES
    let mainTetrix = emptyMatrix(); // TETRIX IS (probably not) MY TERM FOR THE PLAYFIELD
    let [keys, keyTimers]: [{[key: string]: boolean}, {[key: string]: number}] = [{}, {}] // SELF-EXPLAINATORY
    let rotationPressed = false; // Track if rotation key was already handled
    let heldPiece: Mino | null = null;
    
    let LockDelay = 500
    let HardDropped = false;
    let linesCleared = 0;

    window.addEventListener("keydown", (input) => {
        keys[input.code] = true;
        if (!(input.code in keyTimers)) keyTimers[input.code] = 0
        console.log(input.code);
    }) // KEY PRESSED
    window.addEventListener("keyup", (input) => {
        keys[input.code] = false;
        keyTimers[input.code] = 0
        if (input.code === CONTROLS.CW || input.code === CONTROLS.CCW || input.code === CONTROLS.R180) {
            rotationPressed = false;
        }
        if (input.code === CONTROLS.HD) {
            HardDropped = false
        }
    }) // KEY RELEASED

    let [GravityTimer, Gravity, Direction, Rotation, LockTimer]: number[] = [0, 1, 0, 0, 0]
    let piece = TETROMINOS[queue[queueNumber]] // do i have to explain
    let RotationState: number = 0 // CURRENT PIECE ROTATION
    let [preRotation, postRotation]: number[] = [0, 0]

    function spawnNextPiece() {
        queueNumber++;
        if (queueNumber >= 7) {
            queue = queue.slice(7).concat(shuffleArray(pieces));
            queueNumber = 0;
        }
        piece = TETROMINOS[queue[queueNumber]];
        RotationState = 0;
        coordinates = { x: Math.round(boardWidth / 2) - 1, y: 0 }; 
    }

    app.ticker.add((ticker) => { // GAME LOOP!!!
        let DELTA = ticker.deltaMS
        GravityTimer += DELTA // ADD TO TIMER
        LockTimer += DELTA
        if (queueNumber == 7) {
            [queue, queueNumber] = [queue.slice(7).concat(shuffleArray(pieces)), 0]
        } // DELETE USED BAG, ADD NEW ONE
        const pieceTetrix = updatePieceTetrix(piece[RotationState], coordinates) // puts piece in 20x10 matrix yeehaw
        for (const key in keyTimers) {
            if (keys[key]) {
                keyTimers[key] += DELTA
            }
        } // increment key timers :nerd:
        
        if (GravityTimer > Gravity * 1000) {
            const TryCoords = { x: coordinates.x, y: coordinates.y + 1 };
            
            if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                coordinates.y++;
            } else {
                // LOCK!
                if (LockTimer >= LockDelay) {
                    mainTetrix = mergeTetrix(mainTetrix, pieceTetrix);
                    LockTimer = 0;
                    spawnNextPiece();
                }
            }
            GravityTimer = 0;
        } // fall

        // this whole thing below > vvvvvvvv < is a stupid fucking overcomplication for moving left, right and soft dropping
        Direction = keys[CONTROLS.LEFT] ? -1 : keys[CONTROLS.RIGHT] ? 1 : keys[CONTROLS.SD] ? 11 /* THIS IS SOFT DROP  IK ITS DUMB */ : 0
        const dirLookup: { [key: string]: string } = {
            [-1]: CONTROLS.LEFT,
            [1]: CONTROLS.RIGHT,
            [11]: CONTROLS.SD
        }
        if (Direction) {
            const dirKey = dirLookup[Direction];
            if (keyTimers[dirKey] === 0 || (keyTimers[dirKey] >= PARAM.DAS * 1000 && keyTimers[dirKey] % (PARAM.ARR * 1000) < DELTA)) {
                if (Direction == 11) { // SOFT DROP
                    LockTimer = 0;
                    const TryCoords = { x: coordinates.x, y: coordinates.y + 1 };
                    if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                        coordinates.y++;
                    }
                    keyTimers[CONTROLS.SD] = 0
                } else {
                    const TryCoords = { x: coordinates.x + Direction, y: coordinates.y };
                    if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                        coordinates.x += Direction;
                    }
                    keyTimers[dirKey] = 0
                }
            }
        } // bored

        // you spin me right round baby right round
        Rotation = keys[CONTROLS.CW] ? 1 : keys[CONTROLS.CCW] ? -1 : keys[CONTROLS.R180] ? 2 : 0
        if (Rotation && !rotationPressed) {
            LockTimer = 0;
            preRotation = RotationState
            postRotation = rotate(RotationState, Rotation)
            
            if (!collisionCheck(piece[postRotation], coordinates, mainTetrix)) {
                RotationState = postRotation;
            } else {
                const Transition = TRANSITION(preRotation, postRotation)
                const Kicks = KICKS(queue[queueNumber])

                if (Kicks[Transition]) {
                    for (const [OffsetX, OffsetY] of Kicks[Transition]) {
                    const Try = {
                        x: coordinates.x + OffsetX,
                        y: coordinates.y + OffsetY
                    }
                    if (!collisionCheck(piece[postRotation], Try, mainTetrix)) {
                        // YAY!!!!!!
                        coordinates.x = Try.x;
                        coordinates.y = Try.y;
                        RotationState = postRotation;
                        break;
                    }
                }
            }
            }
            rotationPressed = true; 
            Rotation = 0;
        }
        // hgost piece ooooooo spooky
        let GhostY = boardHeight-1
        for (let drop = coordinates.y; drop < boardHeight; drop++) {
            if (collisionCheck(piece[RotationState], { x: coordinates.x, y: drop }, mainTetrix)) {
                GhostY = drop-1;
                break;
            }
        } // literally hard drop logic
        const ghostTetrix = updatePieceTetrix(piece[RotationState], {x: coordinates.x, y: GhostY})

        // HARD DROP!! finally
        if (keys[CONTROLS.HD] && !HardDropped) {
            for (let drop = coordinates.y; drop < boardHeight; drop++) {
                if (collisionCheck(piece[RotationState], { x: coordinates.x, y: drop }, mainTetrix)) {
                    coordinates.y = drop-1;
                    HardDropped = true;
                    GravityTimer = Gravity * 1000 + 1;
                    LockTimer = LockDelay + 1
                    break;
                }
            }
        }

        // HOLD PIECE!!!!!!!!
        if (keys[CONTROLS.HOLD]) {
            if (heldPiece === null) {
                heldPiece = queue[queueNumber];
                spawnNextPiece();
            } else {
                const Swap = heldPiece;
                heldPiece = queue[queueNumber];
                queue[queueNumber] = Swap;
                piece = TETROMINOS[queue[queueNumber]];
                RotationState = 0;
                coordinates = { x: Math.round(boardWidth / 2) - 1, y: 0 };
            }
            keys[CONTROLS.HOLD] = false; // prevent multiple holds
        }
     
        const staticTetrix = mergeTetrix(mainTetrix, ghostTetrix.map(row => row.map(cell => cell !== 0 ? -1 : 0))) // main + ghost
        const displayTetrix = mergeTetrix(staticTetrix, pieceTetrix) // final thingy
        clearLines(mainTetrix);
        updatePlayfield(cells, displayTetrix)
    })
})();