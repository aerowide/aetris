import { Container, Graphics } from 'pixi.js';
import { COLORS } from '../../data/COLORS';
import { PARAM } from '../../data/PARAMETERS';
import { emptyMatrix } from '../../utils/UTILS';
const { boardWidth, boardHeight, cellSize } = PARAM;

export function createPlayfield() {
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
export function updatePlayfield(cells: Graphics[][], board: number[][]) {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const colorKey = board[y][x] !== 0 ? 
                String(board[y][x]) : 'empty';
            const color = COLORS[colorKey as keyof typeof COLORS];
            cells[y][x].clear()
                .rect(x*cellSize, y*cellSize, cellSize, cellSize)
            switch (colorKey) {
                case 'empty':
                    cells[y][x].stroke({
                        color: color,
                        alpha: 0.4,
                        width: 2
                    });;
                    break;
                case 'ghost':
                    cells[y][x].fill(color, 0.3);
                    break;
                default:
                    cells[y][x].fill(color)
            }
        }
    }
}
export function updatePieceTetrix(piece: number[][], coords: {[key: string]: number}) {
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

export function mergeTetrix(mainTetrix: number[][], pieceTetrix: number[][]) {
    const result = mainTetrix.map(row => [...row]); 
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (pieceTetrix[y][x] !== 0) {
                result[y][x] = pieceTetrix[y][x];
            }
        }
    }
    return result;
}