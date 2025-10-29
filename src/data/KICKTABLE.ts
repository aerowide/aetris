// SRS kicktable ough

type KickOffset = [number, number]; // x, y
type RotationTransition = '0->R' | 'R->0' | 'R->2' | '2->R' | '2->L' | 'L->2' | 'L->0' | '0->L';

// J, L, S, T, Z
export const JLSTZ_KICKS: Record<RotationTransition, KickOffset[]> = {
    '0->R': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    'R->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    'R->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '2->R': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '2->L': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    'L->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    'L->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '0->L': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
};

// I
export const I_KICKS: Record<RotationTransition, KickOffset[]> = {
    '0->R': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    'R->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    'R->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2->R': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2->L': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    'L->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    'L->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0->L': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};

export const O_KICKS: Record<RotationTransition, KickOffset[]> = {
    '0->R': [[2, -2], [-2, -2]],
    'R->0': [[-1, -1], [-1, 1]],
    'R->2': [[1, -1], [-1, -1]],
    '2->R': [[-1, -1], [-1, 1]],
    '2->L': [[1, -1], [-1, -1]],
    'L->2': [[-1, -1], [-1, 1]],
    'L->0': [[1, -1], [-1, -1]],
    '0->L': [[-1, -1], [-1, 1]] // O-spin #realshit
};

export function TRANSITION(from: number, to: number): RotationTransition {
    const states = ['0', 'R', '2', 'L'];
    return `${states[from]}->${states[to]}` as RotationTransition;
}

export function KICKS(pieceType: string): Record<RotationTransition, KickOffset[]> {
    if (pieceType === 'i') return I_KICKS;
    if (pieceType === 'o') return O_KICKS;
    return JLSTZ_KICKS;
}