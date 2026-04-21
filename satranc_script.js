// =============================================
// i18n — Language System
// =============================================
const translations = {
    tr: {
        // Overlay
        overlayDesc: 'Sade, zorlayıcı ve lo-fi atmosferli satranç deneyimi.',
        difficultyLabel: 'Zorluk:',
        easy1: 'Kolay (Derinlik 1)',
        medium2: 'Orta (Derinlik 2)',
        hard3: 'Zor (Derinlik 3)',
        veryHard4: 'Çok Zor (Derinlik 4 - Yavaş)',
        startGame: 'Oyuna Başla',
        // Sidebar
        botBlack: 'Bot (Siyah)',
        botWhite: 'Bot (Beyaz)',
        youWhite: 'Sen (Beyaz)',
        youBlack: 'Sen (Siyah)',
        waiting: 'Bekleniyor...',
        yourTurnWaiting: 'Sıra sende mi? Bekleniyor...',
        botDifficulty: 'Bot Zorluğu',
        easy: 'Kolay',
        medium: 'Orta',
        hard: 'Zor',
        veryHard: 'Çok Zor',
        restart: 'Yeniden Başlat',
        switchSide: 'Taraf Değiştir',
        language: 'Dil',
        // Right panel
        moveHistory: 'Hamle Geçmişi',
        spotifyInputPlaceholder: 'Spotify Linki Girin...',
        loadSpotifyBtn: 'Yükle',
        volumeLevel: 'Ses Seviyesi',
        // Game status
        thinking: 'Düşünüyor...',
        calculating: 'Hesaplanıyor...',
        yourTurn: 'Sıra sende',
        gameOver: 'Oyun Bitti',
        white: 'Beyaz',
        black: 'Siyah',
        checkmate: (color) => `Oyun Bitti, ${color} mat oldu.`,
        draw: 'Oyun Bitti, Berabere (Draw)',
        turnOf: (color) => `${color}'ın Sırası`,
        check: ', Şah!',
        // Toasts
        gameStarted: 'Oyun Başladı! İlk hamle beyazın.',
        gameReset: 'Oyun sıfırlandı.',
        difficultyUpdated: 'Zorluk seviyesi güncellendi.',
        sideChanged: (color) => `Taraf değiştirildi. Sizin renginiz: ${color}`,
        gameRestarted: 'Oyun yeniden başladı!',
        // Game Over Modal
        won: (name) => `${name} Kazandı!`,
        checkmateEnd: 'Mat ile oyun sona erdi',
        drawTitle: 'Berabere!',
        stalemate: 'Pat — hamle yapılamıyor',
        threefold: 'Üç kere tekrar',
        insufficientMaterial: 'Yetersiz malzeme',
        drawEnd: 'Oyun berabere bitti',
        playAgain: 'Yeniden Oyna',
        adjustDifficulty: 'Zorluğu Ayarla',
    },
    en: {
        // Overlay
        overlayDesc: 'A clean, challenging chess experience with lo-fi vibes.',
        difficultyLabel: 'Difficulty:',
        easy1: 'Easy (Depth 1)',
        medium2: 'Medium (Depth 2)',
        hard3: 'Hard (Depth 3)',
        veryHard4: 'Very Hard (Depth 4 - Slow)',
        startGame: 'Start Game',
        // Sidebar
        botBlack: 'Bot (Black)',
        botWhite: 'Bot (White)',
        youWhite: 'You (White)',
        youBlack: 'You (Black)',
        waiting: 'Waiting...',
        yourTurnWaiting: 'Your turn? Waiting...',
        botDifficulty: 'Bot Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        veryHard: 'Very Hard',
        restart: 'Restart',
        switchSide: 'Switch Side',
        language: 'Language',
        // Right panel
        moveHistory: 'Move History',
        spotifyInputPlaceholder: 'Enter Spotify Link...',
        loadSpotifyBtn: 'Load',
        volumeLevel: 'Volume',
        // Game status
        thinking: 'Thinking...',
        calculating: 'Calculating...',
        yourTurn: 'Your turn',
        gameOver: 'Game Over',
        white: 'White',
        black: 'Black',
        checkmate: (color) => `Game Over, ${color} is checkmated.`,
        draw: 'Game Over, Draw',
        turnOf: (color) => `${color}'s Turn`,
        check: ', Check!',
        // Toasts
        gameStarted: 'Game Started! White moves first.',
        gameReset: 'Game reset.',
        difficultyUpdated: 'Difficulty updated.',
        sideChanged: (color) => `Side changed. Your color: ${color}`,
        gameRestarted: 'Game restarted!',
        // Game Over Modal
        won: (name) => `${name} Wins!`,
        checkmateEnd: 'Game ended by checkmate',
        drawTitle: 'Draw!',
        stalemate: 'Stalemate — no legal moves',
        threefold: 'Threefold repetition',
        insufficientMaterial: 'Insufficient material',
        drawEnd: 'Game ended in a draw',
        playAgain: 'Play Again',
        adjustDifficulty: 'Adjust Difficulty',
    }
};

let currentLang = localStorage.getItem('chessLang') || 'tr';

function t(key, ...args) {
    const val = translations[currentLang][key];
    if (typeof val === 'function') return val(...args);
    return val || key;
}

function applyLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = translations[currentLang][key];
        if (text && typeof text === 'string') {
            el.textContent = text;
        }
    });
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const text = translations[currentLang][key];
        if (text && typeof text === 'string') {
            el.title = text;
        }
    });
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = translations[currentLang][key];
        if (text && typeof text === 'string') {
            el.placeholder = text;
        }
    });
    // Update lang toggle button labels (sidebar + overlay)
    const langLabel = document.getElementById('langLabel');
    if (langLabel) {
        langLabel.textContent = currentLang === 'tr' ? 'EN' : 'TR';
    }
    const overlayLangLabel = document.getElementById('overlayLangLabel');
    if (overlayLangLabel) {
        overlayLangLabel.textContent = currentLang === 'tr' ? 'EN' : 'TR';
    }
    // Update html lang attribute
    document.documentElement.lang = currentLang === 'tr' ? 'tr' : 'en';
}

// Variables
let board = null;
let game = new Chess();
let botDepth = 3;
let moveCount = 1;
let playerColor = 'w';

// Audio and UI Elements
const startOverlay = document.getElementById('startOverlay');
const startGameBtn = document.getElementById('startGameBtn');
const difficultySelect = document.getElementById('difficulty');
const botStatus = document.getElementById('botStatus');
const toastEl = document.getElementById('toast');
const moveHistoryEl = document.getElementById('moveHistory');

// Game Over Modal Elements
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverIcon = document.getElementById('gameOverIcon');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverSubtitle = document.getElementById('gameOverSubtitle');

// Spotify Elements
const spotifyInput = document.getElementById('spotifyInput');
const loadSpotifyBtn = document.getElementById('loadSpotifyBtn');
const spotifyIframe = document.getElementById('spotifyIframe');

// Initialize board configuration
const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('myBoard', config);

// --- Apply saved language on page load ---
applyLanguage();

// --- Helper: Update player name labels based on current color + language ---
function updatePlayerNames() {
    const userName = document.getElementById('userName');
    const botName = document.getElementById('botName');
    if (playerColor === 'w') {
        userName.textContent = t('youWhite');
        userName.setAttribute('data-i18n', 'youWhite');
        botName.textContent = t('botBlack');
        botName.setAttribute('data-i18n', 'botBlack');
    } else {
        userName.textContent = t('youBlack');
        userName.setAttribute('data-i18n', 'youBlack');
        botName.textContent = t('botWhite');
        botName.setAttribute('data-i18n', 'botWhite');
    }
}

// --- Language Toggle ---
function toggleLanguage() {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('chessLang', currentLang);
    applyLanguage();
    updatePlayerNames();
    // Re-apply dynamic bot status text
    if (game.game_over()) {
        botStatus.innerText = t('gameOver');
    } else {
        botStatus.innerText = game.turn() !== playerColor ? t('thinking') : t('yourTurn');
    }
}

document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);
document.getElementById('overlayLangBtn').addEventListener('click', toggleLanguage);

// --- Prevent mobile scroll when touching the board ---
const boardEl = document.getElementById('myBoard');
boardEl.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// =============================================
// TAP-TO-MOVE SYSTEM (Chess.com style)
// =============================================
let selectedSquare = null;

function clearHighlights() {
    // Only remove classes from elements that actually have them (much faster than scanning all 64 squares)
    $('#myBoard .selected-square').removeClass('selected-square');
    $('#myBoard .valid-move').removeClass('valid-move');
    $('#myBoard .valid-capture').removeClass('valid-capture');
    selectedSquare = null;
}

function highlightMoves(square) {
    const moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return false;
    selectedSquare = square;
    $('#myBoard .square-' + square).addClass('selected-square');
    moves.forEach(function(m) {
        $('#myBoard .square-' + m.to).addClass(m.captured ? 'valid-capture' : 'valid-move');
    });
    return true;
}

function handleSquareTap(square) {
    if (!square || game.game_over() || game.turn() !== playerColor) return;
    const piece = game.get(square);

    // --- A piece is already selected ---
    if (selectedSquare) {
        const $sq = $('#myBoard .square-' + square);

        // Tapped valid target → make the move
        if ($sq.hasClass('valid-move') || $sq.hasClass('valid-capture')) {
            const from = selectedSquare;
            clearHighlights();
            const move = game.move({ from: from, to: square, promotion: 'q' });
            if (move) {
                board.position(game.fen());
                updateStatus();
                updateMoveHistoryUI();
                botStatus.innerText = t('thinking');
                setTimeout(makeBotMove, 300);
                return;
            }
        }

        // Tapped another own piece → switch selection
        if (piece && piece.color === playerColor && square !== selectedSquare) {
            clearHighlights();
            highlightMoves(square);
            return;
        }

        // Anything else → deselect
        clearHighlights();
        return;
    }

    // --- No piece selected → select own piece ---
    if (piece && piece.color === playerColor) {
        highlightMoves(square);
    }
}

// ---- COORDINATE-BASED SQUARE DETECTION ----
// Uses pure math from click coordinates. Immune to chessboard.js
// DOM manipulation (floating pieces, snapback animations, etc.)
function coordsToSquare(clientX, clientY) {
    // The inner board div that contains all squares
    const inner = boardEl.querySelector('.board-b72b1');
    const target = inner || boardEl;
    const r = target.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;

    const x = clientX - r.left;
    const y = clientY - r.top;
    const sz = r.width / 8;

    let col = Math.floor(x / sz);
    let row = Math.floor(y / sz);

    if (col < 0 || col > 7 || row < 0 || row > 7) return null;

    // Flip for black orientation
    if (board.orientation() === 'black') {
        col = 7 - col;
        row = 7 - row;
    }

    return 'abcdefgh'[col] + (8 - row);
}

function isPointOnBoard(x, y) {
    const inner = boardEl.querySelector('.board-b72b1');
    const target = inner || boardEl;
    const r = target.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

// ---- TAP DETECTION ----
// Registers at document level in CAPTURE PHASE so events can't be
// swallowed by chessboard.js. Uses a 300ms debounce to prevent
// double-fire from pointer + touch event chains.
let _tapX = 0, _tapY = 0, _tapActive = false, _lastTapTime = 0;

function tapStart(x, y) {
    if (!isPointOnBoard(x, y)) { _tapActive = false; return; }
    _tapX = x;
    _tapY = y;
    _tapActive = true;
}

function tapMove(x, y) {
    if (!_tapActive) return;
    if (Math.abs(x - _tapX) > 10 || Math.abs(y - _tapY) > 10) {
        _tapActive = false; // moved too much → it's a drag, not a tap
    }
}

function tapEnd() {
    if (!_tapActive) return;
    _tapActive = false;

    // Debounce: pointer + touch both fire for the same gesture
    var now = Date.now();
    if (now - _lastTapTime < 300) return;
    _lastTapTime = now;

    var cx = _tapX, cy = _tapY;
    // Delay so chessboard.js finishes its snapback animation
    setTimeout(function() {
        var sq = coordsToSquare(cx, cy);
        handleSquareTap(sq);
    }, 120);
}

// --- Pointer events (modern, covers both mouse & touch) ---
document.addEventListener('pointerdown', function(e) {
    tapStart(e.clientX, e.clientY);
}, true);
document.addEventListener('pointermove', function(e) {
    tapMove(e.clientX, e.clientY);
}, true);
document.addEventListener('pointerup', function() {
    tapEnd();
}, true);

// --- Touch events (fallback for devices without pointer events) ---
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 0) tapStart(e.touches[0].clientX, e.touches[0].clientY);
}, true);
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) tapMove(e.touches[0].clientX, e.touches[0].clientY);
}, true);
document.addEventListener('touchend', function() {
    tapEnd();
}, true);

// --- Event Listeners ---

startGameBtn.addEventListener('click', () => {
    botDepth = parseInt(difficultySelect.value);
    startOverlay.style.opacity = '0';
    setTimeout(() => {
        document.getElementById('inGameDifficulty').value = botDepth;
        startOverlay.style.display = 'none';
        showToast(t('gameStarted'));
    }, 500);
});

 

// --- Spotify Logic ---
loadSpotifyBtn.addEventListener('click', () => {
    let url = spotifyInput.value.trim();
    if (!url) return;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'open.spotify.com') {
            const path = urlObj.pathname;
            const newSrc = `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
            spotifyIframe.src = newSrc;
        }
    } catch (e) {
        console.log("Invalid Spotify URL");
    }
});

document.getElementById('inGameDifficulty').addEventListener('change', (e) => {
    botDepth = parseInt(e.target.value);
    difficultySelect.value = botDepth;
    showToast(t('difficultyUpdated'));
});

document.getElementById('resetBtn').addEventListener('click', () => {
    hideGameOverModal();
    game.reset();
    board.start();
    clearHighlights();
    _prevCheckSquare = null;
    updatePlayerNames();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    _renderedMoveCount = 0;
    moveCount = 1;
    showToast(t('gameReset'));
    if (playerColor === 'b') {
        botStatus.innerText = t('thinking');
        window.setTimeout(makeBotMove, 300);
    }
});

document.getElementById('switchSideBtn').addEventListener('click', () => {
    hideGameOverModal();
    playerColor = playerColor === 'w' ? 'b' : 'w';
    board.orientation(playerColor === 'w' ? 'white' : 'black');
    updatePlayerNames();

    game.reset();
    board.start();
    clearHighlights();
    _prevCheckSquare = null;
    updateStatus();
    moveHistoryEl.innerHTML = '';
    _renderedMoveCount = 0;
    moveCount = 1;
    showToast(t('sideChanged', playerColor === 'w' ? t('white') : t('black')));
    
    if (playerColor === 'b') {
        botStatus.innerText = t('thinking');
        window.setTimeout(makeBotMove, 300);
    }
});

// --- Chessboard Logic ---

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;

    // Sıra oyuncuda değilse (bot hamle yapıyorken vb.) taş tutulmasını engelle (pre-move iptali)
    if (game.turn() !== playerColor) return false;

    if (playerColor === 'w' && piece.search(/^b/) !== -1) return false;
    if (playerColor === 'b' && piece.search(/^w/) !== -1) return false;
}

function onDrop(source, target) {
    // Same square = tap/click, not a drag → let pointerup handler deal with it
    if (source === target) return 'snapback';

    // Real drag: clear any tap-to-move highlights
    clearHighlights();

    // Hamleyi dene
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Her zaman vezire terfi
    });

    // Geçersiz hamleyse geri al
    if (move === null) return 'snapback';

    updateStatus();
    updateMoveHistoryUI();

    // Bot'un oynaması için bekle
    botStatus.innerText = t('thinking');
    window.setTimeout(makeBotMove, 300);
}

// Tahtayı motorun hamlelerinden sonra güncelle
function onSnapEnd() {
    board.position(game.fen());
}

// --- UI Updates ---

function updateStatus() {
    highlightCheck();

    let status = '';
    let moveColor = game.turn() === 'w' ? t('white') : t('black');

    if (game.in_checkmate()) {
        status = t('checkmate', moveColor);
        showToast(status);
        botStatus.innerText = t('gameOver');
        // Determine winner: the side that just got mated is game.turn()
        const loserColor = game.turn();
        if (loserColor === playerColor) {
            showGameOverModal('lose');
        } else {
            showGameOverModal('win');
        }
    } else if (game.in_draw()) {
        status = t('draw');
        showToast(status);
        botStatus.innerText = t('gameOver');
        showGameOverModal('draw');
    } else {
        status = t('turnOf', moveColor);
        if (game.in_check()) {
            status += t('check');
        }
        botStatus.innerText = game.turn() !== playerColor ? t('thinking') : t('yourTurn');
    }
}

// --- GAME OVER MODAL ---

function showGameOverModal(result) {
    // result: 'win', 'lose', 'draw'
    gameOverIcon.className = 'game-over-icon'; // reset classes

    if (result === 'win') {
        const winnerName = playerColor === 'w' ? t('white') : t('black');
        gameOverIcon.innerHTML = '<i class="fa-solid fa-crown"></i>';
        gameOverIcon.classList.add('win');
        gameOverTitle.textContent = t('won', winnerName);
        gameOverSubtitle.textContent = t('checkmateEnd');
    } else if (result === 'lose') {
        const winnerName = playerColor === 'w' ? t('black') : t('white');
        gameOverIcon.innerHTML = '<i class="fa-solid fa-skull"></i>';
        gameOverIcon.classList.add('lose');
        gameOverTitle.textContent = t('won', winnerName);
        gameOverSubtitle.textContent = t('checkmateEnd');
    } else {
        gameOverIcon.innerHTML = '<i class="fa-solid fa-handshake"></i>';
        gameOverIcon.classList.add('draw');
        gameOverTitle.textContent = t('drawTitle');
        if (game.in_stalemate()) {
            gameOverSubtitle.textContent = t('stalemate');
        } else if (game.in_threefold_repetition()) {
            gameOverSubtitle.textContent = t('threefold');
        } else if (game.insufficient_material()) {
            gameOverSubtitle.textContent = t('insufficientMaterial');
        } else {
            gameOverSubtitle.textContent = t('drawEnd');
        }
    }

    // Remove difficulty selector if it was previously added
    const existingDiffSelect = gameOverOverlay.querySelector('.game-over-difficulty-select');
    if (existingDiffSelect) existingDiffSelect.remove();

    // Small delay so CSS transition plays
    setTimeout(() => {
        gameOverOverlay.classList.add('visible');
    }, 600);
}

function hideGameOverModal() {
    gameOverOverlay.classList.remove('visible');
}

// Game Over Modal button handlers
document.getElementById('gameOverReplay').addEventListener('click', () => {
    hideGameOverModal();
    game.reset();
    board.start();
    clearHighlights();
    _prevCheckSquare = null;
    updatePlayerNames();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    _renderedMoveCount = 0;
    moveCount = 1;
    showToast(t('gameRestarted'));
    if (playerColor === 'b') {
        botStatus.innerText = t('thinking');
        window.setTimeout(makeBotMove, 300);
    }
});

document.getElementById('gameOverDifficulty').addEventListener('click', () => {
    const actionsDiv = document.querySelector('.game-over-actions');
    // Toggle difficulty selector
    let existing = actionsDiv.querySelector('.game-over-difficulty-select');
    if (existing) {
        existing.remove();
        return;
    }
    const diffDiv = document.createElement('div');
    diffDiv.className = 'game-over-difficulty-select';
    diffDiv.innerHTML = `
        <label>${t('difficultyLabel')}</label>
        <select id="gameOverDiffSelect">
            <option value="1" ${botDepth === 1 ? 'selected' : ''}>${t('easy')}</option>
            <option value="2" ${botDepth === 2 ? 'selected' : ''}>${t('medium')}</option>
            <option value="3" ${botDepth === 3 ? 'selected' : ''}>${t('hard')}</option>
            <option value="4" ${botDepth === 4 ? 'selected' : ''}>${t('veryHard')}</option>
        </select>
    `;
    actionsDiv.appendChild(diffDiv);
    document.getElementById('gameOverDiffSelect').addEventListener('change', (e) => {
        botDepth = parseInt(e.target.value);
        document.getElementById('inGameDifficulty').value = botDepth;
        difficultySelect.value = botDepth;
        showToast(t('difficultyUpdated'));
    });
});

document.getElementById('gameOverSwitch').addEventListener('click', () => {
    hideGameOverModal();
    playerColor = playerColor === 'w' ? 'b' : 'w';
    board.orientation(playerColor === 'w' ? 'white' : 'black');
    updatePlayerNames();

    game.reset();
    board.start();
    clearHighlights();
    _prevCheckSquare = null;
    updateStatus();
    moveHistoryEl.innerHTML = '';
    _renderedMoveCount = 0;
    moveCount = 1;
    showToast(t('sideChanged', playerColor === 'w' ? t('white') : t('black')));
    
    if (playerColor === 'b') {
        botStatus.innerText = t('thinking');
        window.setTimeout(makeBotMove, 300);
    }
});

function showToast(msg) {
    toastEl.innerText = msg;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// Track rendered move count to enable incremental updates
let _renderedMoveCount = 0;

function updateMoveHistoryUI() {
    const history = game.history();
    const totalMoves = history.length;

    // Full reset detection (game was reset)
    if (totalMoves < _renderedMoveCount) {
        moveHistoryEl.innerHTML = '';
        _renderedMoveCount = 0;
    }

    // Nothing new to render
    if (totalMoves === _renderedMoveCount) {
        moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
        return;
    }

    // Black just moved → update the last row's black cell
    if (totalMoves === _renderedMoveCount + 1 && totalMoves % 2 === 0) {
        const lastRow = moveHistoryEl.lastElementChild;
        if (lastRow) {
            lastRow.querySelector('.move-black').textContent = history[totalMoves - 1];
            _renderedMoveCount = totalMoves;
            moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
            return;
        }
    }

    // White just moved → append a new row
    // (Also handles edge cases where multiple moves need rendering)
    const startIdx = _renderedMoveCount % 2 === 0 ? _renderedMoveCount : _renderedMoveCount - 1;
    // If the last row was incomplete, remove it and re-render from that pair
    if (_renderedMoveCount % 2 !== 0 && moveHistoryEl.lastElementChild) {
        moveHistoryEl.removeChild(moveHistoryEl.lastElementChild);
    }

    const fragment = document.createDocumentFragment();
    const actualStart = _renderedMoveCount % 2 !== 0 ? _renderedMoveCount - 1 : _renderedMoveCount;
    for (let i = actualStart; i < totalMoves; i += 2) {
        const rowNum = Math.floor(i / 2) + 1;
        const row = document.createElement('div');
        row.className = 'move-row';
        row.innerHTML =
            '<div class="move-number">' + rowNum + '.</div>' +
            '<div class="move-white">' + history[i] + '</div>' +
            '<div class="move-black">' + (history[i + 1] || '') + '</div>';
        fragment.appendChild(row);
    }
    moveHistoryEl.appendChild(fragment);
    _renderedMoveCount = totalMoves;
    moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
}

// Cache previous check square to avoid unnecessary DOM work
let _prevCheckSquare = null;

function highlightCheck() {
    // Remove previous check highlight only if one existed
    if (_prevCheckSquare) {
        $('.square-' + _prevCheckSquare).removeClass('in-check');
        _prevCheckSquare = null;
    }
    if (game.in_check() || game.in_checkmate()) {
        const color = game.turn();
        const kingSq = findKingSquare(color);
        if (kingSq) {
            $('.square-' + kingSq).addClass('in-check');
            _prevCheckSquare = kingSq;
        }
    }
}

function findKingSquare(color) {
    const b = game.board();
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            if (b[r][c] && b[r][c].type === 'k' && b[r][c].color === color) {
                const files = ['a','b','c','d','e','f','g','h'];
                const rank = 8 - r;
                return files[c] + rank;
            }
        }
    }
    return null;
}

// --- BOT LOGIC (Web Worker) ---

const botWorker = new Worker('satranc_worker.js');
// Pre-warm: force chess.js download now, not on first move
botWorker.postMessage({ type: 'warmup' });

botWorker.onmessage = function(e) {
    const bestMove = e.data;
    if (bestMove) {
        game.move(bestMove);
        board.position(game.fen());
        clearHighlights(); // Clear any lingering highlights after bot moves
        updateStatus();
        updateMoveHistoryUI();
    }
};

function makeBotMove() {
    if (game.game_over()) return;
    
    botStatus.innerText = t('calculating');
    
    botWorker.postMessage({
        fen: game.fen(),
        depth: botDepth,
        isBotWhite: playerColor === 'b',
        history: game.history()
    });
}

// --- MOBILE RESPONSIVE LOGIC ---

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMusicBtn = document.getElementById('mobileMusicBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const sidebar = document.querySelector('.sidebar');
const rightPanel = document.querySelector('.right-panel');

function isMobileView() {
    return window.innerWidth <= 1100;
}

function closeAllDrawers() {
    sidebar.classList.remove('open');
    rightPanel.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    mobileMenuBtn.classList.remove('active');
    mobileMusicBtn.classList.remove('active');
    document.body.style.overflow = '';
}

mobileMenuBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('open');
    closeAllDrawers();
    if (!isOpen) {
        sidebar.classList.add('open');
        mobileOverlay.classList.add('visible');
        mobileMenuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

mobileMusicBtn.addEventListener('click', () => {
    const isOpen = rightPanel.classList.contains('open');
    closeAllDrawers();
    if (!isOpen) {
        rightPanel.classList.add('open');
        mobileOverlay.classList.add('visible');
        mobileMusicBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

mobileOverlay.addEventListener('click', closeAllDrawers);

// Close drawers on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDrawers();
});

// Resize board on window resize / orientation change
function resizeBoard() {
    if (board && typeof board.resize === 'function') {
        board.resize();
    }
}

window.addEventListener('resize', () => {
    resizeBoard();
    // Auto-close drawers if switching to desktop
    if (!isMobileView()) {
        closeAllDrawers();
    }
});

window.addEventListener('orientationchange', () => {
    setTimeout(resizeBoard, 300);
});

// Swipe gesture support to close drawers
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only consider horizontal swipes (deltaX significantly larger than deltaY)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
        // Swipe left on sidebar -> close it
        if (deltaX < 0 && sidebar.classList.contains('open')) {
            closeAllDrawers();
        }
        // Swipe right on right panel -> close it
        if (deltaX > 0 && rightPanel.classList.contains('open')) {
            closeAllDrawers();
        }
    }
    
    // Swipe down on bottom-sheet right panel (phones)
    if (window.innerWidth <= 600 && deltaY > 80 && rightPanel.classList.contains('open')) {
        closeAllDrawers();
    }
}, { passive: true });

// --- QR CODE POPUP ---
const qrOverlay = document.getElementById('qrOverlay');
const qrBtn = document.getElementById('qrBtn');
const qrClose = document.getElementById('qrClose');

qrBtn.addEventListener('click', () => {
    qrOverlay.classList.add('visible');
});

qrClose.addEventListener('click', () => {
    qrOverlay.classList.remove('visible');
});

qrOverlay.addEventListener('click', (e) => {
    if (e.target === qrOverlay) {
        qrOverlay.classList.remove('visible');
    }
});
