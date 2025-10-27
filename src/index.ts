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
    await app.init({ background: '#444444', resizeTo: window });
    document.body.appendChild(app.canvas);
    return app;
}
function emptyMatrix() { // MATRIX OF ZEROS !! very important yes
    return (Array(boardHeight).fill(0)).map(() => Array(boardWidth).fill(0))
}
function rotate(curr: number, x: number) {
    return (curr + x + 4) % 4 // BASE-4 NUMBER, overflows/underflows :3
}
function createPlayfield() {
    const container = new Container()
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const cell = new Graphics()
            cell.rect(x*cellSize, y*cellSize, cellSize, cellSize)
                .fill(COLORS.empty);
            container.addChild(cell);
        }
    } return container;
}
function updatePlayfield(container: Container, board: number[][]) {
    container.removeChildren()
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const cell = new Graphics()
            cell.rect(x*cellSize, y*cellSize, cellSize, cellSize)
                .fill(
                    board[y][x] !== 0 ?
                        COLORS[String(x) as keyof typeof COLORS] : COLORS.empty
                );
            container.addChild(cell);
        }
    } return container;
}
function updatePieceTetrix(piece: number[][], coords: {[key: string]: number}) {
    const pieceTetrix = emptyMatrix();
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (piece[y][x] !== 0) {
                const [X, Y] = [coords.x + x, coords.y + y]
                if (X >= 0 && X < boardWidth && Y >= 0 && Y < boardHeight) {
                    pieceTetrix[Y][X] = piece[y][x]
                }
            }
        }
    } return pieceTetrix;
}
function collisionCheck(mainTetrix: number[][], pieceTetrix: number[][]): boolean {
    const [rows, columns] = [boardHeight, boardWidth]
    for (let y = 0; y < rows; y++) {
        if (mainTetrix[y] == emptyRow || pieceTetrix[y] == emptyRow) continue;
        for (let x = 0; x < columns; x++) {
            if (mainTetrix[y][x] && pieceTetrix[y][x]) return true;
        }
    }
    return false
}

(async () => {
    const app = await prepare()
    let [queue, queueNumber]: [Mino[], number] = [shuffleArray(pieces).concat(shuffleArray(pieces)), 0]; // 7-BAG QUEUE
    let coordinates: {[key: string]: number} = {x: Math.round(boardWidth / 2), y: 0}; // COORDINATES
    let mainTetrix = emptyMatrix(); // TETRIX IS (probably not) MY TERM FOR THE PLAYFIELD

    let [keys, keyTimers]: [{[key: string]: boolean}, {[key: string]: number}] = [{}, {}] // SELF-EXPLAINATORY
    window.addEventListener("keydown", (input) => {
        keys[input.key] = true;
        if (!(input.key in keyTimers)) keyTimers[input.key] = 0
    }) // KEY HELD DOWN
    window.addEventListener("keyup", (input) => {
        keys[input.key] = false;
        keyTimers[input.key] = 0
    }) // KEY RELEASED

    let Playfield = createPlayfield()
    app.stage.addChild(Playfield); // ADD PLAYFIELD TO uhhhh yea

    let [GravityTimer, Gravity, Direction, Rotation]: number[] = [0, 1, 0, 0]
    let piece = TETROMINOS[queue[queueNumber]] // do i have to explain
    let RotationState: number = 0 // CURRENT PIECE ROTATION
    let previousPieceState = {
        x: coordinates.x,
        y: coordinates.y,
        r: RotationState
    }
    let [preRotation, postRotation]: number[] = [0, 0]

    app.ticker.add((ticker) => { // GAME LOOP!!!
        let DELTA = ticker.deltaMS
        GravityTimer += DELTA // ADD TO TIMER
        if (queueNumber == 7) {
            [queue, queueNumber] = [queue.splice(7, 13).concat(shuffleArray(pieces)), 0]
        } // DELETE USED BAG, ADD NEW ONE
        const pieceTetrix = updatePieceTetrix(piece[RotationState], coordinates) // puts piece in 20x10 matrix yeehaw
        for (const key in keyTimers) {
            if (keys[key]) {
                keyTimers[key] += DELTA
            }
        } // increment key timers :nerd:
        if (GravityTimer > (Gravity / 2) * 1000 && !collisionCheck(mainTetrix, pieceTetrix)) {
            coordinates.y++
        } // fall

        // this whole thing below > vvvvvvvv < is a stupid fucking overcomplication for moving left, right and soft dropping
        Direction = keys[CONTROLS.LEFT] ? -1 : keys[CONTROLS.RIGHT] ? 1 : keys[CONTROLS.SD] ? 11 /* THIS IS SOFT DROP  IK ITS DUMB */ : 0
        const dirLookup: { [key: string]: string } = {
            [-1]: CONTROLS.LEFT,
            [1]: CONTROLS.RIGHT,
            [11]: CONTROLS.SD
        }
        if (Direction && keyTimers[dirLookup[Direction]] >= PARAM.ARR * 1000) {
            if (Direction == 11) { // SOFT DROP
                coordinates.y++
                keyTimers[CONTROLS.SD] = 0
            } else {
                coordinates.x += Direction
                keyTimers[dirLookup[Direction]] = 0
            }
        }

        // you spin me right round baby right round
        Rotation = keys[CONTROLS.CW] ? 1 : keys[CONTROLS.CCW] ? -1 : keys[CONTROLS.R180] ? 2 : 0
        if (Rotation) {
            preRotation = RotationState
            RotationState = rotate(RotationState, Rotation)
            postRotation = RotationState
            if (collisionCheck(mainTetrix, pieceTetrix)) {
                const Transition = TRANSITION(preRotation, postRotation)
                const Kicks = KICKS(pieces[queueNumber])

                for (const [OffsetX, OffsetY] of Kicks[Transition]) {
                    const Try = {
                        x: coordinates.x + OffsetX,
                        y: coordinates.y + OffsetY
                    }
                    const TryPieceTetrix = updatePieceTetrix(piece[postRotation], Try);
                    if (!collisionCheck(mainTetrix, TryPieceTetrix)) {
                        // YAY!!!!!!
                        coordinates.x = Try.x;
                        coordinates.y = Try.y;
                        RotationState = postRotation;
                        break;
                    }
                }
            }
        } // then rotate lol

        updatePlayfield(Playfield, pieceTetrix)
    })
})();
