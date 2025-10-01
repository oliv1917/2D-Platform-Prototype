const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spilverden
const gravity = 0.6;
const friction = 0.8;

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

const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');
const restartButton = document.getElementById('restartButton');
let messageHideTimeout = null;
let isGamePaused = false;
const goalMessage = 'Du klarede niveauet!';

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

function placePlayerAtStart() {
  player.x = 50;
  player.y = 0;
  player.dx = 0;
  player.dy = 0;
  player.grounded = false;
  player.currentPlatform = null;
}

function resetGame() {
  placePlayerAtStart();
  hidePlatformMessage();
  isGamePaused = false;
  keys.left = false;
  keys.right = false;
  keys.up = false;
}

function handleGoalReached() {
  if (isGamePaused) return;

  isGamePaused = true;
  player.dx = 0;
  player.dy = 0;
  keys.left = false;
  keys.right = false;
  keys.up = false;
  showGoalMessage();
}

if (restartButton) {
  restartButton.addEventListener('click', resetGame);
}

// Platforme
const platforms = [
  {
    x: 0,
    y: 400,
    width: 800,
    height: 50,
    message: "Velkommen til banen!"
  },
  {
    x: 200,
    y: 320,
    width: 100,
    height: 20,
    message: "Godt hoppet!"
  },
  {
    x: 400,
    y: 260,
    width: 100,
    height: 20,
    message: "Du er halvvejs."
  },
  {
    x: 600,
    y: 200,
    width: 100,
    height: 20,
    message: "Næsten i mål!"
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
const keys = {
  right: false,
  left: false,
  up: false
};

document.addEventListener('keydown', e => {
  if (isGamePaused) {
    if (['Enter', 'Space', 'KeyR'].includes(e.code)) {
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
    if (landedOnPlatform.isGoal) {
      handleGoalReached();
    } else if (landedOnPlatform.message) {
      showPlatformMessage(landedOnPlatform.message);
    } else {
      hidePlatformMessage();
    }
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

loop();
