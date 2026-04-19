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
let tapStartX = 0;
let tapStartY = 0;
let wasDragged = false;
const TAP_THRESHOLD = 8; // px - movement below this = tap

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
        const cls = (m.captured || game.get(m.to)) ? 'valid-capture' : 'valid-move';
        $('#myBoard .square-' + m.to).addClass(cls);
    });
    return true;
}

// Try to execute a tap-to-move action for the given square
function handleSquareTap(square) {
    if (!square) return;
    if (game.game_over()) return;
    if (game.turn() !== playerColor) return;

    const piece = game.get(square);

    // --- CASE 1: A piece is already selected ---
    if (selectedSquare) {
        const $target = $('#myBoard .square-' + square);

        // 1a: Tapped on a highlighted valid-move or valid-capture square → MOVE
        if ($target.hasClass('valid-move') || $target.hasClass('valid-capture')) {
            const fromSq = selectedSquare;
            clearHighlights();
            const move = game.move({
                from: fromSq,
                to: square,
                promotion: 'q'
            });
            if (move) {
                board.position(game.fen());
                updateStatus();
                updateMoveHistoryUI();
                botStatus.innerText = "Düşünüyor...";
                window.setTimeout(makeBotMove, 250);
                return;
            }
        }

        // 1b: Tapped on another own piece → switch selection
        if (piece && piece.color === playerColor && square !== selectedSquare) {
            clearHighlights();
            highlightMoves(square);
            return;
        }

        // 1c: Tapped same square again or empty/invalid square → deselect
        clearHighlights();
        return;
    }

    // --- CASE 2: No piece selected yet ---
    if (piece && piece.color === playerColor) {
        highlightMoves(square);
    }
}

// Resolve a screen coordinate to a board square name (e.g. "e4")
function getSquareAt(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const sq = el.closest('[data-square]');
    return sq ? sq.getAttribute('data-square') : null;
}

// --- Pointer event listeners for tap detection ---
// We use pointerdown/pointerup which unify mouse + touch.
// A tiny setTimeout on pointerup lets chessboard.js finish its
// own drop processing before we inspect the board state.

boardEl.addEventListener('pointerdown', function(e) {
    tapStartX = e.clientX;
    tapStartY = e.clientY;
    wasDragged = false;
}, { passive: true });

boardEl.addEventListener('pointermove', function(e) {
    if (!wasDragged) {
        const dx = Math.abs(e.clientX - tapStartX);
        const dy = Math.abs(e.clientY - tapStartY);
        if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) {
            wasDragged = true;
        }
    }
}, { passive: true });

boardEl.addEventListener('pointerup', function(e) {
    // Only process taps, not drags
    if (wasDragged) return;

    const cx = e.clientX;
    const cy = e.clientY;

    // Small delay so chessboard.js finishes snap-back first
    setTimeout(function() {
        const square = getSquareAt(cx, cy);
        handleSquareTap(square);
    }, 50);
}, { passive: true });

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
    game.reset();
    board.start();
    clearHighlights();
    updateStatus();
    moveHistoryEl.innerHTML = '';
    moveCount = 1;
    showToast("Oyun sıfırlandı.");
    if (playerColor === 'b') {
        botStatus.innerText = "Düşünüyor...";
        window.setTimeout(makeBotMove, 250);
    }
});

document.getElementById('switchSideBtn').addEventListener('click', () => {
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
        window.setTimeout(makeBotMove, 250);
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
    window.setTimeout(makeBotMove, 250);
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
    } else if (game.in_draw()) {
        status = 'Oyun Bitti, Berabere (Draw)';
        showToast(status);
        botStatus.innerText = "Oyun Bitti";
    } else {
        status = `${moveColor}'ın Sırası`;
        if (game.in_check()) {
            status += ', Şah!';
        }
        botStatus.innerText = game.turn() !== playerColor ? "Düşünüyor..." : "Sıra sende";
    }
}

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
