"use strict";
// SRS kicktable ough
Object.defineProperty(exports, "__esModule", { value: true });
exports.O_KICKS = exports.I_KICKS = exports.JLSTZ_KICKS = void 0;
exports.TRANSITION = TRANSITION;
exports.KICKS = KICKS;
// J, L, S, T, Z
exports.JLSTZ_KICKS = {
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
exports.I_KICKS = {
    '0->R': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    'R->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    'R->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2->R': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2->L': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    'L->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    'L->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0->L': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};
exports.O_KICKS = {
    '0->R': [[1, -1], [1, 1]],
    'R->0': [[-1, -1], [-1, 1]],
    'R->2': [[1, -1], [1, 1]],
    '2->R': [[-1, -1], [-1, 1]],
    '2->L': [[1, -1], [1, 1]],
    'L->2': [[-1, -1], [-1, 1]],
    'L->0': [[1, -1], [1, 1]],
    '0->L': [[-1, -1], [-1, 1]] // O-spin #realshit
};
function TRANSITION(from, to) {
    const states = ['0', 'R', '2', 'L'];
    return `${states[from]}->${states[to]}`;
}
function KICKS(pieceType) {
    if (pieceType === 'i')
        return exports.I_KICKS;
    if (pieceType === 'o')
        return exports.O_KICKS;
    return exports.JLSTZ_KICKS;
}
