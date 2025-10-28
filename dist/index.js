"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pixi_js_1 = require("pixi.js");
const COLORS_1 = require("./data/COLORS");
const PIECES_1 = require("./data/PIECES");
const CONTROLS_1 = require("./data/CONTROLS");
const PARAMETERS_1 = require("./data/PARAMETERS");
const HELPERS_1 = require("./HELPERS");
const KICKTABLE_1 = require("./data/KICKTABLE");
const [boardWidth, boardHeight, cellSize] = [10, 25, 20];
const emptyRow = Array(boardWidth).fill(0);
const pieces = ['o', 't', 'l', 'j', 's', 'z', 'i'];
function prepare() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new pixi_js_1.Application();
        yield app.init({ background: '#444444', resizeTo: window });
        document.body.appendChild(app.canvas);
        return app;
    });
}
function emptyMatrix() {
    return (Array(boardHeight).fill(0)).map(() => Array(boardWidth).fill(0));
}
function rotate(curr, x) {
    return (curr + x + 4) % 4; // BASE-4 NUMBER, overflows/underflows :3
}
function createPlayfield() {
    const container = new pixi_js_1.Container();
    const cells = [];
    for (let y = 0; y < boardHeight; y++) {
        cells[y] = [];
        for (let x = 0; x < boardWidth; x++) {
            const cell = new pixi_js_1.Graphics();
            cell.rect(x * cellSize, y * cellSize, cellSize, cellSize)
                .fill(COLORS_1.COLORS.empty);
            container.addChild(cell);
            cells[y][x] = cell;
        }
    }
    return { container, cells };
}
function updatePlayfield(cells, board) {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const colorKey = board[y][x] !== 0 ?
                String(board[y][x]) : 'empty';
            cells[y][x].clear()
                .rect(x * cellSize, y * cellSize, cellSize, cellSize)
                .fill(COLORS_1.COLORS[colorKey]);
        }
    }
}
function updatePieceTetrix(piece, coords) {
    const pieceTetrix = emptyMatrix();
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const [X, Y] = [coords.x + x, coords.y + y];
                if (X >= 0 && X < boardWidth && Y >= 0 && Y < boardHeight) {
                    pieceTetrix[Y][X] = piece[y][x];
                }
            }
        }
    }
    return pieceTetrix;
}
function collisionCheck(piece, coords, mainTetrix) {
    // Check collision by testing piece at coordinates against board AND bounds
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                const [X, Y] = [coords.x + x, coords.y + y];
                // Check bounds (walls, floor, ceiling)
                if (X < 0 || X >= boardWidth || Y < 0 || Y >= boardHeight) {
                    return true;
                }
                // Check collision with existing blocks
                if (mainTetrix[Y][X] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}
function mergeTetrix(mainTetrix, pieceTetrix) {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const app = yield prepare();
    let [queue, queueNumber] = [(0, HELPERS_1.shuffleArray)(pieces).concat((0, HELPERS_1.shuffleArray)(pieces)), 0]; // 7-BAG QUEUE
    let coordinates = { x: Math.round(boardWidth / 2), y: 0 }; // COORDINATES
    let mainTetrix = emptyMatrix(); // TETRIX IS (probably not) MY TERM FOR THE PLAYFIELD
    let [keys, keyTimers] = [{}, {}]; // SELF-EXPLAINATORY
    let rotationPressed = false; // Track if rotation key was already handled
    window.addEventListener("keydown", (input) => {
        // Prevent arrow keys and space from scrolling the page
        if (input.key.startsWith('Arrow') || input.key === ' ') {
            input.preventDefault();
        }
        keys[input.key] = true;
        if (!(input.key in keyTimers))
            keyTimers[input.key] = 0;
    }); // KEY PRESSED
    window.addEventListener("keyup", (input) => {
        keys[input.key] = false;
        keyTimers[input.key] = 0;
        // Reset rotation flag when rotation keys are released
        if (input.key === CONTROLS_1.CONTROLS.CW || input.key === CONTROLS_1.CONTROLS.CCW || input.key === CONTROLS_1.CONTROLS.R180) {
            rotationPressed = false;
        }
    }); // KEY RELEASED
    const { container: Playfield, cells } = createPlayfield();
    app.stage.addChild(Playfield); // ADD PLAYFIELD TO uhhhh yea
    let [GravityTimer, Gravity, Direction, Rotation] = [0, 1, 0, 0];
    let piece = PIECES_1.TETROMINOS[queue[queueNumber]]; // do i have to explain
    let RotationState = 0; // CURRENT PIECE ROTATION
    let previousPieceState = {
        x: coordinates.x,
        y: coordinates.y,
        r: RotationState
    };
    let [preRotation, postRotation] = [0, 0];
    function spawnNextPiece() {
        queueNumber++;
        if (queueNumber >= 7) {
            queue = queue.slice(7).concat((0, HELPERS_1.shuffleArray)(pieces));
            queueNumber = 0;
        }
        piece = PIECES_1.TETROMINOS[queue[queueNumber]];
        RotationState = 0;
        coordinates = { x: Math.round(boardWidth / 2) - 1, y: 0 };
    }
    if (Object.keys(keys).some(k => keys[k])) {
        console.log('Keys pressed:', Object.keys(keys).filter(k => keys[k]));
    }
    app.ticker.add((ticker) => {
        let DELTA = ticker.deltaMS;
        GravityTimer += DELTA; // ADD TO TIMER
        if (queueNumber == 7) {
            [queue, queueNumber] = [queue.slice(7).concat((0, HELPERS_1.shuffleArray)(pieces)), 0];
        } // DELETE USED BAG, ADD NEW ONE
        const pieceTetrix = updatePieceTetrix(piece[RotationState], coordinates); // puts piece in 20x10 matrix yeehaw
        for (const key in keyTimers) {
            if (keys[key]) {
                keyTimers[key] += DELTA;
            }
        } // increment key timers :nerd:
        if (GravityTimer > Gravity * 1000) {
            const TryCoords = { x: coordinates.x, y: coordinates.y + 1 };
            if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                coordinates.y++;
            }
            else {
                // LOCK!
                mainTetrix = mergeTetrix(mainTetrix, pieceTetrix);
                spawnNextPiece();
            }
            GravityTimer = 0; // ← RESET TIMER!
        } // fall
        // this whole thing below > vvvvvvvv < is a stupid fucking overcomplication for moving left, right and soft dropping
        Direction = keys[CONTROLS_1.CONTROLS.LEFT] ? -1 : keys[CONTROLS_1.CONTROLS.RIGHT] ? 1 : keys[CONTROLS_1.CONTROLS.SD] ? 11 /* THIS IS SOFT DROP  IK ITS DUMB */ : 0;
        const dirLookup = {
            [-1]: CONTROLS_1.CONTROLS.LEFT,
            [1]: CONTROLS_1.CONTROLS.RIGHT,
            [11]: CONTROLS_1.CONTROLS.SD
        };
        if (Direction) {
            const dirKey = dirLookup[Direction];
            // Immediate movement on first press (DAS = 0) OR after ARR delay
            if (keyTimers[dirKey] === 0 || keyTimers[dirKey] >= PARAMETERS_1.PARAM.ARR * 1000) {
                if (Direction == 11) { // SOFT DROP
                    const TryCoords = { x: coordinates.x, y: coordinates.y + 1 };
                    if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                        coordinates.y++;
                    }
                    keyTimers[CONTROLS_1.CONTROLS.SD] = 0;
                }
                else {
                    const TryCoords = { x: coordinates.x + Direction, y: coordinates.y };
                    if (!collisionCheck(piece[RotationState], TryCoords, mainTetrix)) {
                        coordinates.x += Direction;
                    }
                    keyTimers[dirKey] = 0;
                }
            }
        }
        // you spin me right round baby right round
        Rotation = keys[CONTROLS_1.CONTROLS.CW] ? 1 : keys[CONTROLS_1.CONTROLS.CCW] ? -1 : keys[CONTROLS_1.CONTROLS.R180] ? 2 : 0;
        if (Rotation && !rotationPressed) {
            rotationPressed = true;
            preRotation = RotationState;
            postRotation = rotate(RotationState, Rotation);
            if (!collisionCheck(piece[postRotation], coordinates, mainTetrix)) {
                RotationState = postRotation;
            }
            else {
                const Transition = (0, KICKTABLE_1.TRANSITION)(preRotation, postRotation);
                const Kicks = (0, KICKTABLE_1.KICKS)(queue[queueNumber]);
                for (const [OffsetX, OffsetY] of Kicks[Transition]) {
                    const Try = {
                        x: coordinates.x + OffsetX,
                        y: coordinates.y + OffsetY
                    };
                    if (!collisionCheck(piece[postRotation], Try, mainTetrix)) {
                        // YAY!!!!!!
                        coordinates.x = Try.x;
                        coordinates.y = Try.y;
                        RotationState = postRotation;
                        break;
                    }
                }
            }
            Rotation = 0;
        } // then rotate lol
        const displayTetrix = mergeTetrix(mainTetrix, pieceTetrix);
        updatePlayfield(cells, displayTetrix);
    });
}))();
