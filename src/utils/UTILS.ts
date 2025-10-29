export function shuffleArray(array: Array<any>) { // DURSTENFELD SHUFFLE ALGO
    for (let i = array.length - 1; i >= 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    } return array;
}

export function rotate(curr: number, x: number) {
    return (curr + x + 4) % 4 // BASE-4 NUMBER, overflows/underflows :3
}
export function emptyMatrix(boardHeight = 24, boardWidth = 10): number[][] {
    return (Array(boardHeight).fill(0)).map(() => Array(boardWidth).fill(0))
}

export const emptyRow = (boardWidth: number) => {return Array(boardWidth).fill(0)}