const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spilverden
const gravity = 0.6;
const friction = 0.8;

// Samleobjekter
const coins = [
  { x: 250, y: 290, radius: 10, collected: false },
  { x: 450, y: 230, radius: 10, collected: false },
  { x: 630, y: 170, radius: 10, collected: false }
];

let score = 0;

// Spiller
const player = {
  x: 50,
  y: 0,
  width: 30,
  height: 30,
  color: "#333",
  dx: 0,
  dy: 0,
  speed: 4,
  jumpForce: -12,
  grounded: false,
  currentPlatform: null
};

const keys = {
  right: false,
  left: false,
  up: false
};

const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');
const restartButton = document.getElementById('restartButton');
const scoreValue = document.getElementById('scoreValue');
const platformModal = document.getElementById('platformModal');
const platformModalText = document.getElementById('platformModalText');
const platformModalClose = document.getElementById('platformModalClose');
let messageHideTimeout = null;
let isGamePaused = false;
let isModalOpen = false;
let pauseReason = null;
const goalMessage = 'Du klarede niveauet!';

function pauseGame(reason) {
  if (isGamePaused && pauseReason === reason) {
    return;
  }

  isGamePaused = true;
  pauseReason = reason;
  player.dx = 0;
  player.dy = 0;
  keys.left = false;
  keys.right = false;
  keys.up = false;
}

function resumeGame(reason) {
  if (pauseReason !== reason) {
    return;
  }

  pauseReason = null;
  isGamePaused = false;
}

function updateScoreDisplay() {
  if (!scoreValue) return;
  scoreValue.textContent = String(score);
}

function resetCoins() {
  for (const coin of coins) {
    coin.collected = false;
  }
  score = 0;
  updateScoreDisplay();
}

function showPlatformMessage(message) {
  if (!messageOverlay || !messageText) return;

  messageOverlay.classList.remove('persistent');

  if (restartButton) {
    restartButton.hidden = true;
  }

  if (!message) {
    hidePlatformMessage();
    return;
  }

  messageText.textContent = message;
  messageOverlay.classList.add('visible');

  if (messageHideTimeout) {
    clearTimeout(messageHideTimeout);
  }

  messageHideTimeout = setTimeout(() => {
    hidePlatformMessage();
  }, 3000);
}

function showGoalMessage() {
  if (!messageOverlay || !messageText) return;

  if (messageHideTimeout) {
    clearTimeout(messageHideTimeout);
    messageHideTimeout = null;
  }

  messageText.textContent = goalMessage;
  messageOverlay.classList.add('visible');
  messageOverlay.classList.add('persistent');

  if (restartButton) {
    restartButton.hidden = false;
    restartButton.focus();
  }
}

function hidePlatformMessage() {
  if (!messageOverlay || !messageText) return;

  if (messageHideTimeout) {
    clearTimeout(messageHideTimeout);
    messageHideTimeout = null;
  }

  messageOverlay.classList.remove('visible');
  messageOverlay.classList.remove('persistent');
  messageText.textContent = '';

  if (restartButton) {
    restartButton.hidden = true;
  }
}

function showPlatformModal(message) {
  if (!platformModal || !platformModalText) return;

  platformModalText.textContent = message || '';
  platformModal.classList.add('visible');
  platformModal.setAttribute('aria-hidden', 'false');
  isModalOpen = true;
  pauseGame('modal');

  if (platformModalClose) {
    platformModalClose.focus();
  }
}

function hidePlatformModal() {
  if (!platformModal || !isModalOpen) return;

  platformModal.classList.remove('visible');
  platformModal.setAttribute('aria-hidden', 'true');
  if (platformModalText) {
    platformModalText.textContent = '';
  }
  if (platformModalClose) {
    platformModalClose.blur();
  }
  isModalOpen = false;
  resumeGame('modal');
}

function onReachPlatform(platform) {
  if (!platform) return;

  if (platform.isGoal) {
    handleGoalReached();
    return;
  }

  if (typeof platform.onReach === 'function') {
    hidePlatformMessage();
    platform.onReach(platform);
    return;
  }

  if (platform.message) {
    showPlatformMessage(platform.message);
  } else {
    hidePlatformMessage();
  }
}

function placePlayerAtStart() {
  player.x = 50;
  player.y = 0;
  player.dx = 0;
  player.dy = 0;
  player.grounded = false;
  player.currentPlatform = null;
}

function resetGame() {
  hidePlatformModal();
  hidePlatformMessage();
  pauseReason = null;
  isGamePaused = false;
  keys.left = false;
  keys.right = false;
  keys.up = false;
  placePlayerAtStart();
  resetCoins();
}

function handleGoalReached() {
  if (pauseReason === 'goal') return;

  pauseGame('goal');
  showGoalMessage();
}

if (restartButton) {
  restartButton.addEventListener('click', resetGame);
}

if (platformModalClose) {
  platformModalClose.addEventListener('click', () => {
    hidePlatformModal();
  });
}

if (platformModal) {
  platformModal.addEventListener('click', event => {
    if (event.target === platformModal) {
      hidePlatformModal();
    }
  });
}

// Platforme
const platforms = [
  {
    x: 0,
    y: 400,
    width: 800,
    height: 50,
    onReach() {
      showPlatformModal('Velkommen til banen!');
    }
  },
  {
    x: 200,
    y: 320,
    width: 100,
    height: 20,
    onReach() {
      showPlatformModal('Godt hoppet!');
    }
  },
  {
    x: 400,
    y: 260,
    width: 100,
    height: 20,
    onReach() {
      showPlatformModal('Du er halvvejs.');
    }
  },
  {
    x: 600,
    y: 200,
    width: 100,
    height: 20,
    onReach() {
      showPlatformModal('Næsten i mål!');
    }
  },
  {
    x: 720,
    y: 160,
    width: 60,
    height: 20,
    isGoal: true
  }
];

// Input

document.addEventListener('keydown', e => {
  if (isGamePaused) {
    if (pauseReason === 'modal') {
      if (e.code === 'KeyR') {
        e.preventDefault();
        resetGame();
        return;
      }

      if (['Escape', 'Enter', 'Space'].includes(e.code)) {
        e.preventDefault();
        hidePlatformModal();
      }
    } else if (['Enter', 'Space', 'KeyR'].includes(e.code)) {
      e.preventDefault();
      resetGame();
    }
    return;
  }

  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', e => {
  if (isGamePaused) return;

  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowUp') keys.up = false;
});

function update() {
  if (isGamePaused) {
    return;
  }

  // Bevægelse
  if (keys.left) player.dx = -player.speed;
  else if (keys.right) player.dx = player.speed;
  else player.dx *= friction;

  // Hop
  if (keys.up && player.grounded) {
    player.dy = player.jumpForce;
    player.grounded = false;
  }

  // Tyngdekraft
  player.dy += gravity;

  // Opdater position
  player.x += player.dx;
  player.y += player.dy;

  // Kollision med platforme
  const previousPlatform = player.currentPlatform;
  player.grounded = false;
  let landedOnPlatform = null;

  for (let p of platforms) {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y < p.y + p.height &&
      player.y + player.height > p.y
    ) {
      // På toppen
      if (player.dy > 0 && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.grounded = true;
        landedOnPlatform = p;
      }
    }
  }

  if (landedOnPlatform && landedOnPlatform !== previousPlatform) {
    onReachPlatform(landedOnPlatform);
  } else if (!landedOnPlatform && previousPlatform && !previousPlatform.isGoal) {
    hidePlatformMessage();
  }

  player.currentPlatform = landedOnPlatform;

  // Begræns til canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y > canvas.height) {
    // Falder ud af banen – reset
    placePlayerAtStart();
    hidePlatformMessage();
    hidePlatformModal();
    resetCoins();
  }

  for (const coin of coins) {
    if (coin.collected) continue;
    const closestX = Math.max(player.x, Math.min(coin.x, player.x + player.width));
    const closestY = Math.max(player.y, Math.min(coin.y, player.y + player.height));
    const dx = coin.x - closestX;
    const dy = coin.y - closestY;
    if (dx * dx + dy * dy <= coin.radius * coin.radius) {
      coin.collected = true;
      score += 1;
      updateScoreDisplay();
    }
  }
}

function draw() {
  // Baggrund
  ctx.fillStyle = "#aaddff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Platforme
  for (let p of platforms) {
    ctx.fillStyle = p.isGoal ? "#2ecc71" : "#444";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // Coins
  for (const coin of coins) {
    if (coin.collected) continue;
    ctx.beginPath();
    ctx.fillStyle = "#f1c40f";
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f39c12";
    ctx.stroke();
  }

  // Spiller
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function loop() {
  if (!isGamePaused) {
    update();
  }
  draw();
  requestAnimationFrame(loop);
}

resetCoins();
loop();
