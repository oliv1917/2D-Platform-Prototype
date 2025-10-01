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
let messageHideTimeout = null;

function showPlatformMessage(message) {
  if (!messageOverlay) return;

  if (!message) {
    hidePlatformMessage();
    return;
  }

  messageOverlay.textContent = message;
  messageOverlay.classList.add('visible');

  if (messageHideTimeout) {
    clearTimeout(messageHideTimeout);
  }

  messageHideTimeout = setTimeout(() => {
    hidePlatformMessage();
  }, 3000);
}

function hidePlatformMessage() {
  if (!messageOverlay) return;

  if (messageHideTimeout) {
    clearTimeout(messageHideTimeout);
    messageHideTimeout = null;
  }

  messageOverlay.classList.remove('visible');
  messageOverlay.textContent = '';
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
  }
];

// Input
const keys = {
  right: false,
  left: false,
  up: false
};

document.addEventListener('keydown', e => {
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowUp') keys.up = false;
});

function update() {
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
    if (landedOnPlatform.message) {
      showPlatformMessage(landedOnPlatform.message);
    } else {
      hidePlatformMessage();
    }
  } else if (!landedOnPlatform && previousPlatform) {
    hidePlatformMessage();
  }

  player.currentPlatform = landedOnPlatform;

  // Begræns til canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y > canvas.height) {
    // Falder ud af banen – reset
    player.x = 50;
    player.y = 0;
    player.dx = 0;
    player.dy = 0;
  }
}

function draw() {
  // Baggrund
  ctx.fillStyle = "#aaddff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Platforme
  for (let p of platforms) {
    ctx.fillStyle = "#444";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // Spiller
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
