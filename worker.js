// worker.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js');

// Taş Puanları
const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

// Basit Konum Puanlaması (PST)
const pawnEvalWhite = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5,  5,  5,  5,  5,  5,  5,  5],
    [1,  1,  2,  3,  3,  2,  1,  1],
    [0.5,  0.5,  1,  2.5,  2.5,  1,  0.5,  0.5],
    [0,  0,  0,  2,  2,  0,  0,  0],
    [0.5, -0.5,-1,  0,  0, -1, -0.5,  0.5],
    [0.5,  1, 1,  -2, -2,  1,  1,  0.5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];
const pawnEvalBlack = pawnEvalWhite.slice().reverse();

const knightEval = [
    [-2.5, -2.0, -1.5, -1.5, -1.5, -1.5, -2.0, -2.5],
    [-2.0, -1.0,  0.0,  0.0,  0.0,  0.0, -1.0, -2.0],
    [-1.5,  0.0,  0.5,  0.7,  0.7,  0.5,  0.0, -1.5],
    [-1.5,  0.3,  0.7,  1.0,  1.0,  0.7,  0.3, -1.5],
    [-1.5,  0.0,  0.7,  1.0,  1.0,  0.7,  0.0, -1.5],
    [-1.5,  0.3,  0.5,  0.7,  0.7,  0.5,  0.3, -1.5],
    [-2.0, -1.0,  0.0,  0.3,  0.3,  0.0, -1.0, -2.0],
    [-2.5, -2.0, -1.5, -1.5, -1.5, -1.5, -2.0, -2.5]
];

// Basit bir açılış kütüphanesi (İlk hamleler için)
const openingBook = {
    '0': ['e4', 'd4', 'c4'], // Beyaz için ilk hamleler
    'e4': ['c5', 'e5', 'e6', 'c6'], // Siyahın e4'e yanıtları
    'd4': ['d5', 'Nf6', 'e6'], // Siyahın d4'e yanıtları
    'c4': ['e5', 'c5', 'Nf6'], // Siyahın c4'e yanıtları
    'Nf3': ['d5', 'Nf6', 'c5'] // Siyahın Nf3'e yanıtları
};

function evaluateBoard(g) {
    let totalEvaluation = 0;
    const b = g.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(b[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece, x, y) {
    if (piece === null) return 0;
    let val = pieceValues[piece.type];
    
    // Konum bonusu
    if (piece.type === 'p') {
        val += (piece.color === 'w' ? pawnEvalWhite[x][y] : pawnEvalBlack[x][y]);
    } else if (piece.type === 'n') {
        val += knightEval[x][y];
    }
    
    // Beyaz pozitif, siyah negatif
    return piece.color === 'w' ? val : -val;
}

function minimax(g, depth, alpha, beta, isMaximizingPlayer) {
    if (g.in_checkmate()) {
        return isMaximizingPlayer ? -99999 + (10 - depth) : 99999 - (10 - depth);
    }
    if (g.in_draw() || g.in_stalemate() || g.in_threefold_repetition()) {
        return 0;
    }
    if (depth === 0) {
        return evaluateBoard(g);
    }

    const possibleMoves = g.moves();

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            g.move(possibleMoves[i]);
            bestVal = Math.max(bestVal, minimax(g, depth - 1, alpha, beta, !isMaximizingPlayer));
            g.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            g.move(possibleMoves[i]);
            bestVal = Math.min(bestVal, minimax(g, depth - 1, alpha, beta, !isMaximizingPlayer));
            g.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

function getBestMove(g, depth, isBotWhite, history) {
    let possibleMoves = g.moves({ verbose: true });
    possibleMoves.sort(() => Math.random() - 0.5);

    // Açılış kütüphanesi kontrolü
    if (history.length === 0) {
        // Bot beyaz oynuyor, ilk hamlesi
        const ops = openingBook['0'];
        return ops[Math.floor(Math.random() * ops.length)];
    } else if (history.length === 1) {
        // Bot siyah oynuyor, beyazın ilk hamlesine yanıt
        const ops = openingBook[history[0]];
        if (ops) {
            return ops[Math.floor(Math.random() * ops.length)];
        }
    }

    let bestValue = isBotWhite ? -Infinity : Infinity; 
    let bestMove = null;

    for (let i = 0; i < possibleMoves.length; i++) {
        const move = possibleMoves[i];
        g.move(move.san);
        
        let boardValue = minimax(g, depth - 1, -Infinity, Infinity, !isBotWhite);
        
        g.undo();

        if (isBotWhite) {
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move.san;
            }
        } else {
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move.san;
            }
        }
    }

    return bestMove;
}

onmessage = function(e) {
    const { fen, depth, isBotWhite, history } = e.data;
    const g = new Chess(fen);
    
    // Calculate best move synchronously (inside worker, this doesn't block UI)
    const bestMove = getBestMove(g, depth, isBotWhite, history);
    
    // Send it back to the main thread
    postMessage(bestMove);
}
