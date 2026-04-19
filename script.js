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

// Music Player Elements
const playPauseBtn = document.getElementById('playPauseBtn');
const prevTrackBtn = document.getElementById('prevTrackBtn');
const nextTrackBtn = document.getElementById('nextTrackBtn');
const rewindBtn = document.getElementById('rewindBtn');
const repeatBtn = document.getElementById('repeatBtn');
const trackTitleSpan = document.getElementById('trackTitle');
const musicSpinIcon = document.getElementById('musicSpinIcon');
const lofiPlayer = document.getElementById('lofiPlayer');
const toggleMuteBtn = document.getElementById('toggleMute');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationTimeSpan = document.getElementById('durationTime');

let isMuted = false;
let isPlaying = false;
let isLoopingSingle = false;
let currentTrackIndex = 0;

const playlist = [
    { title: "Below Zero", src: "Below Zero.mp3" },
    { title: "New Moon", src: "New Moon.mp3" },
    { title: "On It Goes", src: "On It Goes.mp3" },
    { title: "Sebastian Kamae - Solitude", src: "Sebastian Kamae - Solitude.mp3" },
    { title: "Swept Away", src: "Swept Away.mp3" }
];

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
    $('#myBoard .square-55d63').removeClass('selected-square valid-move valid-capture');
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
                botStatus.innerText = "Düşünüyor...";
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
        showToast("Oyun Başladı! İlk hamle beyazın.");
        
        loadTrack(0);
        lofiPlayer.volume = volumeSlider.value;
        lofiPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseBtn();
        }).catch(e => console.log("Audio play error:", e));
        
        isMuted = false;
        lofiPlayer.muted = false;
        updateMuteButton();
    }, 500);
});

 

// --- Music Player Logic ---

toggleMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    lofiPlayer.muted = isMuted;
    if (isMuted) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = lofiPlayer.volume || 0.3;
    }
    updateMuteButton();
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    lofiPlayer.volume = val;
    if (val > 0 && isMuted) {
        isMuted = false;
        lofiPlayer.muted = false;
        updateMuteButton();
    } else if (val === 0 && !isMuted) {
        isMuted = true;
        lofiPlayer.muted = true;
        updateMuteButton();
    }
});

function updateMuteButton() {
    toggleMuteBtn.innerHTML = isMuted 
        ? '<i class="fa-solid fa-volume-xmark"></i>'
        : '<i class="fa-solid fa-volume-high"></i>';
}

function loadTrack(index) {
    const track = playlist[index];
    lofiPlayer.src = track.src;
    trackTitleSpan.innerText = track.title;
}

function updatePlayPauseBtn() {
    playPauseBtn.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i>' 
        : '<i class="fa-solid fa-play"></i>';
    musicSpinIcon.style.animationPlayState = isPlaying ? 'running' : 'paused';
}

lofiPlayer.addEventListener('ended', () => {
    if (isLoopingSingle) {
        lofiPlayer.currentTime = 0;
        lofiPlayer.play();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        lofiPlayer.play();
    }
});

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        lofiPlayer.pause();
    } else {
        lofiPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayPauseBtn();
});

prevTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) lofiPlayer.play();
});

nextTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) lofiPlayer.play();
});

rewindBtn.addEventListener('click', () => {
    lofiPlayer.currentTime = 0;
});

repeatBtn.addEventListener('click', () => {
    isLoopingSingle = !isLoopingSingle;
    repeatBtn.style.color = isLoopingSingle ? "var(--accent)" : "var(--text-primary)";
});

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

lofiPlayer.addEventListener('timeupdate', () => {
    const current = lofiPlayer.currentTime;
    const duration = lofiPlayer.duration;
    
    if (duration) {
        progressBar.value = (current / duration) * 100;
        currentTimeSpan.innerText = formatTime(current);
        durationTimeSpan.innerText = formatTime(duration);
    }
});

lofiPlayer.addEventListener('loadedmetadata', () => {
    durationTimeSpan.innerText = formatTime(lofiPlayer.duration);
});

progressBar.addEventListener('input', (e) => {
    const duration = lofiPlayer.duration;
    if (duration) {
        lofiPlayer.currentTime = (e.target.value / 100) * duration;
    }
});

document.getElementById('inGameDifficulty').addEventListener('change', (e) => {
    botDepth = parseInt(e.target.value);
    difficultySelect.value = botDepth;
    showToast(`Zorluk seviyesi güncellendi.`);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    hideGameOverModal();
    game.reset();
    board.start();
    clearHighlights();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    moveCount = 1;
    showToast("Oyun sıfırlandı.");
    if (playerColor === 'b') {
        botStatus.innerText = "Düşünüyor...";
        window.setTimeout(makeBotMove, 300);
    }
});

document.getElementById('switchSideBtn').addEventListener('click', () => {
    hideGameOverModal();
    playerColor = playerColor === 'w' ? 'b' : 'w';
    board.orientation(playerColor === 'w' ? 'white' : 'black');
    
    if (playerColor === 'w') {
        document.querySelector('.user-info .details .name').innerText = "Sen (Beyaz)";
        document.querySelector('.bot-info .details .name').innerText = "Bot (Siyah)";
    } else {
        document.querySelector('.user-info .details .name').innerText = "Sen (Siyah)";
        document.querySelector('.bot-info .details .name').innerText = "Bot (Beyaz)";
    }

    game.reset();
    board.start();
    clearHighlights();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    moveCount = 1;
    showToast(`Taraf değiştirildi. Sizin renginiz: ${playerColor === 'w' ? 'Beyaz' : 'Siyah'}`);
    
    if (playerColor === 'b') {
        botStatus.innerText = "Düşünüyor...";
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
    botStatus.innerText = "Düşünüyor...";
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
    let moveColor = game.turn() === 'w' ? 'Beyaz' : 'Siyah';

    if (game.in_checkmate()) {
        status = `Oyun Bitti, ${moveColor} mat oldu.`;
        showToast(status);
        botStatus.innerText = "Oyun Bitti";
        // Determine winner: the side that just got mated is game.turn()
        const loserColor = game.turn();
        if (loserColor === playerColor) {
            // Player lost
            showGameOverModal('lose');
        } else {
            // Player won
            showGameOverModal('win');
        }
    } else if (game.in_draw()) {
        status = 'Oyun Bitti, Berabere (Draw)';
        showToast(status);
        botStatus.innerText = "Oyun Bitti";
        showGameOverModal('draw');
    } else {
        status = `${moveColor}'ın Sırası`;
        if (game.in_check()) {
            status += ', Şah!';
        }
        botStatus.innerText = game.turn() !== playerColor ? "Düşünüyor..." : "Sıra sende";
    }
}

// --- GAME OVER MODAL ---

function showGameOverModal(result) {
    // result: 'win', 'lose', 'draw'
    gameOverIcon.className = 'game-over-icon'; // reset classes

    if (result === 'win') {
        const winnerName = playerColor === 'w' ? 'Beyaz' : 'Siyah';
        gameOverIcon.innerHTML = '<i class="fa-solid fa-crown"></i>';
        gameOverIcon.classList.add('win');
        gameOverTitle.textContent = `${winnerName} Kazandı!`;
        gameOverSubtitle.textContent = 'Mat ile oyun sona erdi';
    } else if (result === 'lose') {
        const winnerName = playerColor === 'w' ? 'Siyah' : 'Beyaz';
        gameOverIcon.innerHTML = '<i class="fa-solid fa-skull"></i>';
        gameOverIcon.classList.add('lose');
        gameOverTitle.textContent = `${winnerName} Kazandı!`;
        gameOverSubtitle.textContent = 'Mat ile oyun sona erdi';
    } else {
        gameOverIcon.innerHTML = '<i class="fa-solid fa-handshake"></i>';
        gameOverIcon.classList.add('draw');
        gameOverTitle.textContent = 'Berabere!';
        if (game.in_stalemate()) {
            gameOverSubtitle.textContent = 'Pat — hamle yapılamıyor';
        } else if (game.in_threefold_repetition()) {
            gameOverSubtitle.textContent = 'Üç kere tekrar';
        } else if (game.insufficient_material()) {
            gameOverSubtitle.textContent = 'Yetersiz malzeme';
        } else {
            gameOverSubtitle.textContent = 'Oyun berabere bitti';
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
    updateStatus();
    moveHistoryEl.innerHTML = '';
    moveCount = 1;
    showToast('Oyun yeniden başladı!');
    if (playerColor === 'b') {
        botStatus.innerText = 'Düşünüyor...';
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
        <label>Zorluk:</label>
        <select id="gameOverDiffSelect">
            <option value="1" ${botDepth === 1 ? 'selected' : ''}>Kolay</option>
            <option value="2" ${botDepth === 2 ? 'selected' : ''}>Orta</option>
            <option value="3" ${botDepth === 3 ? 'selected' : ''}>Zor</option>
            <option value="4" ${botDepth === 4 ? 'selected' : ''}>Çok Zor</option>
        </select>
    `;
    actionsDiv.appendChild(diffDiv);
    document.getElementById('gameOverDiffSelect').addEventListener('change', (e) => {
        botDepth = parseInt(e.target.value);
        document.getElementById('inGameDifficulty').value = botDepth;
        difficultySelect.value = botDepth;
        showToast(`Zorluk seviyesi güncellendi.`);
    });
});

document.getElementById('gameOverSwitch').addEventListener('click', () => {
    hideGameOverModal();
    playerColor = playerColor === 'w' ? 'b' : 'w';
    board.orientation(playerColor === 'w' ? 'white' : 'black');
    
    if (playerColor === 'w') {
        document.querySelector('.user-info .details .name').innerText = 'Sen (Beyaz)';
        document.querySelector('.bot-info .details .name').innerText = 'Bot (Siyah)';
    } else {
        document.querySelector('.user-info .details .name').innerText = 'Sen (Siyah)';
        document.querySelector('.bot-info .details .name').innerText = 'Bot (Beyaz)';
    }

    game.reset();
    board.start();
    clearHighlights();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    moveCount = 1;
    showToast(`Taraf değiştirildi. Sizin renginiz: ${playerColor === 'w' ? 'Beyaz' : 'Siyah'}`);
    
    if (playerColor === 'b') {
        botStatus.innerText = 'Düşünüyor...';
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

function updateMoveHistoryUI() {
    const history = game.history();
    moveHistoryEl.innerHTML = '';
    for (let i = 0; i < history.length; i += 2) {
        const whiteMove = history[i];
        const blackMove = history[i + 1] ? history[i + 1] : '';
        const rowNum = Math.floor(i / 2) + 1;
        
        moveHistoryEl.innerHTML += `
            <div class="move-row">
                <div class="move-number">${rowNum}.</div>
                <div class="move-white">${whiteMove}</div>
                <div class="move-black">${blackMove}</div>
            </div>
        `;
    }
    moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
}

function highlightCheck() {
    $('.square-55d63').removeClass('in-check');
    if (game.in_check() || game.in_checkmate()) {
        const color = game.turn();
        const kingSq = findKingSquare(color);
        if (kingSq) {
            $('.square-' + kingSq).addClass('in-check');
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

const botWorker = new Worker('worker.js');
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
    
    botStatus.innerText = "Hesaplanıyor...";
    
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
