import { emptyRow } from '../../utils/UTILS';
import { PARAM } from '../../data/PARAMETERS';
const { boardWidth, boardHeight } = PARAM;

export function collisionCheck(piece: number[][], coords: {[key: string]: number}, mainTetrix: number[][]): boolean {
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
export function clearTetrixLines(mainTetrix: number[][]) {
    for (let y = boardHeight - 1; y >= 0; y--) {
        if (mainTetrix[y].every(cell => cell !== 0)) {
            mainTetrix.splice(y, 1);
            mainTetrix.unshift([...emptyRow(boardWidth)]);
            y++;
        }
    }
}