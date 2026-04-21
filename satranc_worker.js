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

// Genişletilmiş açılış kütüphanesi — ilk 4 hamleye kadar kapsar
// Anahtar: hamle geçmişi virgülle birleştirilmiş, değer: olası yanıtlar
const openingBook = {
    // === BEYAZ İLK HAMLE ===
    '': ['e4', 'd4', 'Nf3', 'c4'],

    // === SİYAH YANITLARI ===
    'e4': ['e5', 'c5', 'e6', 'c6', 'Nf6', 'd5'],
    'd4': ['d5', 'Nf6', 'e6', 'f5'],
    'Nf3': ['d5', 'Nf6', 'c5', 'g6'],
    'c4': ['e5', 'Nf6', 'c5', 'e6'],

    // === BEYAZ 2. HAMLE ===
    'e4,e5': ['Nf3', 'Bc4', 'f4', 'Nc3'],
    'e4,c5': ['Nf3', 'Nc3', 'c3', 'd4'],
    'e4,e6': ['d4', 'Nf3'],
    'e4,c6': ['d4', 'Nf3', 'Nc3'],
    'e4,Nf6': ['e5', 'Nc3', 'd3'],
    'e4,d5': ['exd5', 'e5', 'Nc3'],
    'd4,d5': ['c4', 'Nf3', 'Bf4'],
    'd4,Nf6': ['c4', 'Nf3', 'Bg5'],
    'd4,e6': ['c4', 'Nf3', 'e4'],
    'd4,f5': ['c4', 'Nf3', 'g3'],
    'Nf3,d5': ['d4', 'g3', 'c4'],
    'Nf3,Nf6': ['d4', 'c4', 'g3'],
    'c4,e5': ['Nc3', 'g3', 'Nf3'],
    'c4,Nf6': ['Nc3', 'd4', 'Nf3'],

    // === SİYAH 2. HAMLE ===
    'e4,e5,Nf3': ['Nc6', 'Nf6', 'd6'],
    'e4,e5,Bc4': ['Nf6', 'Bc5', 'Nc6'],
    'e4,c5,Nf3': ['d6', 'Nc6', 'e6'],
    'e4,c5,d4': ['cxd4'],
    'e4,e6,d4': ['d5'],
    'e4,c6,d4': ['d5'],
    'd4,d5,c4': ['e6', 'c6', 'dxc4'],
    'd4,d5,Nf3': ['Nf6', 'e6', 'c6'],
    'd4,Nf6,c4': ['e6', 'g6', 'c5'],
    'd4,Nf6,Nf3': ['e6', 'd5', 'g6'],

    // === BEYAZ 3. HAMLE ===
    'e4,e5,Nf3,Nc6': ['Bb5', 'Bc4', 'd4'],
    'e4,e5,Nf3,Nf6': ['Nxe5', 'Nc3', 'Bc4'],
    'e4,c5,Nf3,d6': ['d4', 'Bb5+', 'c3'],
    'e4,c5,Nf3,Nc6': ['d4', 'Bb5', 'c3'],
    'd4,d5,c4,e6': ['Nc3', 'Nf3'],
    'd4,d5,c4,c6': ['Nf3', 'Nc3'],
    'd4,Nf6,c4,e6': ['Nc3', 'Nf3', 'g3'],
    'd4,Nf6,c4,g6': ['Nc3', 'Nf3']
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

// Fast move ordering using SAN strings (no expensive verbose calls)
// Captures ('x' in SAN) and checks ('+') are prioritized
function orderMoves(g) {
    const moves = g.moves();
    // Simple & fast: captures first, then checks, then the rest
    const captures = [];
    const checks = [];
    const others = [];
    for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        if (m.indexOf('x') !== -1) captures.push(m);
        else if (m.indexOf('+') !== -1) checks.push(m);
        else others.push(m);
    }
    return captures.concat(checks, others);
}

// Transposition table — caches evaluated positions to avoid redundant work
let transpositionTable = {};

let startTime = 0;
const TIME_LIMIT = 1500; // 1.5 saniyelik kesin süre sınırı!

function minimax(g, depth, alpha, beta, isMaximizingPlayer) {
    if (Date.now() - startTime > TIME_LIMIT) {
        throw new Error("timeout");
    }

    // Check for terminal positions using lightweight move generation
    // g.moves() returns empty array for both checkmate and stalemate
    const possibleMoves = orderMoves(g);
    
    if (possibleMoves.length === 0) {
        // Checkmate or stalemate — check which one
        if (g.in_check()) {
            // Checkmate: penalize more at shallower depth (prefer faster mates)
            return isMaximizingPlayer ? -99999 + (10 - depth) : 99999 - (10 - depth);
        }
        // Stalemate
        return 0;
    }

    // Cheap draw check (insufficient material only — avoids expensive threefold repetition)
    if (g.insufficient_material()) {
        return 0;
    }

    if (depth === 0) {
        return evaluateBoard(g);
    }

    // Transposition table lookup
    const fen = g.fen();
    const ttKey = fen + '|' + depth + '|' + (isMaximizingPlayer ? '1' : '0');
    if (transpositionTable[ttKey] !== undefined) {
        return transpositionTable[ttKey];
    }

    let bestVal;
    if (isMaximizingPlayer) {
        bestVal = -Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            g.move(possibleMoves[i]);
            bestVal = Math.max(bestVal, minimax(g, depth - 1, alpha, beta, false));
            g.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
    } else {
        bestVal = Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            g.move(possibleMoves[i]);
            bestVal = Math.min(bestVal, minimax(g, depth - 1, alpha, beta, true));
            g.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
    }

    // Store in transposition table
    transpositionTable[ttKey] = bestVal;
    return bestVal;
}

function getBestMove(g, depth, isBotWhite, history) {
    startTime = Date.now(); // Hesaplama başlangıç süresini kaydet
    // Clear transposition table for each new move calculation
    transpositionTable = {};

    // Açılış kütüphanesi kontrolü — ilk birkaç hamle için anında yanıt
    const key = history.join(',');
    const bookMoves = openingBook[key];
    if (bookMoves) {
        // Shuffle book moves
        const shuffled = bookMoves.slice().sort(() => Math.random() - 0.5);
        for (let pick of shuffled) {
            const testMove = g.move(pick);
            if (testMove) {
                g.undo();
                return pick;
            }
        }
    }

    // Early game has huge branching factor. Deep searches take too long without captures/forcing moves.
    let searchDepth = depth;
    let pieceCount = 0;
    const brd = g.board();
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            if(brd[r][c]) pieceCount++;
        }
    }
    
    // If there are too many pieces (>20), depth 4+ is mathematically impossible to process fast in JS.
    // So we clamp it dynamically.
    if (pieceCount > 20 && searchDepth > 3) {
        searchDepth = 3;
    }

    // Check for draw conditions at root level only (these are expensive)
    if (g.in_draw() || g.in_threefold_repetition()) {
        // Still need to return a move even in draw
        const moves = g.moves();
        return moves[Math.floor(Math.random() * moves.length)] || null;
    }

    let possibleMoves = g.moves({ verbose: true });

    // Shuffle for variety, then sort with move ordering
    possibleMoves.sort(() => Math.random() - 0.5);

    // Captures first at root level
    possibleMoves.sort((a, b) => {
        const aScore = a.captured ? 1 : 0;
        const bScore = b.captured ? 1 : 0;
        return bScore - aScore;
    });

    let alpha = -Infinity;
    let beta = Infinity;
    let bestValue = isBotWhite ? -Infinity : Infinity; 
    let bestMove = possibleMoves[0]?.san || null;

    for (let i = 0; i < possibleMoves.length; i++) {
        const move = possibleMoves[i];
        g.move(move.san);
        
        try {
            let boardValue = minimax(g, searchDepth - 1, alpha, beta, !isBotWhite);
            
            g.undo();

            if (isBotWhite) {
                if (boardValue > bestValue) {
                    bestValue = boardValue;
                    bestMove = move.san;
                }
                alpha = Math.max(alpha, bestValue);
            } else {
                if (boardValue < bestValue) {
                    bestValue = boardValue;
                    bestMove = move.san;
                }
                beta = Math.min(beta, bestValue);
            }
        } catch (e) {
            g.undo(); // Her ihtimale karşı geri al
            if (e.message === "timeout") {
                // Zaman doldu, en iyi bulduğun hamleyle döngüyü zorla bitir
                break;
            } else {
                throw e; // Başka bir hataysa fırlat
            }
        }
    }

    return bestMove || possibleMoves[0]?.san;
}

onmessage = function(e) {
    // Pre-warm message: just load chess.js, don't calculate
    if (e.data.type === 'warmup') { new Chess(); return; }

    const { fen, depth, isBotWhite, history } = e.data;
    const g = new Chess(fen);
    
    // Calculate best move synchronously (inside worker, this doesn't block UI)
    const bestMove = getBestMove(g, depth, isBotWhite, history);
    
    // Send it back to the main thread
    postMessage(bestMove);
}
