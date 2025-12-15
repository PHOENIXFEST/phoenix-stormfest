// Combined script with fire -> storm sequence + countdown + UI
// Controls:
// - FIRE_DELAY_MS: delay after load before showing fire
// - FIRE_DURATION_MS: how long the fire effect runs before storm starts
// - STORM_AFTER_FIRE: if true, storm (lightning) starts after fire
// Respects prefers-reduced-motion and pauses when tab hidden.

const FIRE_DELAY_MS = 8000;      // wait 8s then start fire
const FIRE_DURATION_MS = 6000;   // run fire for 6s
const STORM_AFTER_FIRE = true;   // start lightning after fire finishes

// Canvas elements
const fireCanvas = document.getElementById('fire');
const lightningCanvas = document.getElementById('lightning');

// Global flags & DPR handling
let dpr = Math.max(window.devicePixelRatio || 1, 1);
function resizeCanvas(canvas) {
  if (!canvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Initialize canvases
if (fireCanvas) resizeCanvas(fireCanvas);
if (lightningCanvas) resizeCanvas(lightningCanvas);

// --- Respect prefers-reduced-motion ---
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  // Do not run animated canvases
  if (fireCanvas) fireCanvas.style.display = 'none';
  if (lightningCanvas) lightningCanvas.style.display = 'none';
}

// Pause behavior on hidden tab
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopFire();
    stopLightning();
  } else {
    // if animations should be running, resume or re-trigger as appropriate.
    // we won't auto-resume the fire sequence; lightning may resume if active.
    if (lightningActive && !prefersReduced) startLightning(); // resume lightning
  }
});

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => {
  dpr = Math.max(window.devicePixelRatio || 1, 1);
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (fireCanvas) resizeCanvas(fireCanvas);
    if (lightningCanvas) resizeCanvas(lightningCanvas);
  }, 120);
});

/* ---------------------------
   FIRE: lightweight particle system
   --------------------------- */
let fireCtx = fireCanvas ? fireCanvas.getContext('2d') : null;
let fireAnimId = null;
let fireParticles = [];
let fireRunning = false;

function createFireParticle(x, y) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: - (Math.random() * 1.6 + 0.8),
    life: Math.random() * 1.2 + 0.6,
    age: 0,
    size: Math.random() * 18 + 8,
    hue: Math.random() * 30 + 20 // warm color range
  };
}

function stepFire(dt) {
  if (!fireCtx || !fireCanvas) return;
  const w = fireCanvas.width / dpr;
  const h = fireCanvas.height / dpr;

  // fade background gently
  fireCtx.fillStyle = 'rgba(0,0,0,0.25)';
  fireCtx.fillRect(0, 0, w, h);

  // spawn particles along bottom center
  const spawnRate = 6; // per frame approx
  for (let i = 0; i < spawnRate; i++) {
    const px = w * (0.45 + Math.random() * 0.1);
    const py = h * (0.9 + Math.random() * 0.05);
    fireParticles.push(createFireParticle(px, py));
    // limit
    if (fireParticles.length > 800) fireParticles.shift();
  }

  // update & draw
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const p = fireParticles[i];
    p.age += dt;
    if (p.age >= p.life) {
      fireParticles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    const t = p.age / p.life;
    const alpha = (1 - t) * 0.9;
    const size = p.size * (1 + t * 0.6);

    // gradient circle
    const grad = fireCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    // color stops: yellow -> orange -> red -> transparent
    const hue = Math.floor(p.hue);
    grad.addColorStop(0, `hsla(${hue}, 100%, 65%, ${alpha})`);
    grad.addColorStop(0.4, `hsla(${hue + 20}, 90%, 50%, ${alpha * 0.7})`);
    grad.addColorStop(0.8, `hsla(${hue + 40}, 80%, 40%, ${alpha * 0.4})`);
    grad.addColorStop(1, `hsla(${hue + 40}, 80%, 30%, 0)`);

    fireCtx.globalCompositeOperation = 'lighter';
    fireCtx.fillStyle = grad;
    fireCtx.beginPath();
    fireCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
    fireCtx.fill();
    fireCtx.globalCompositeOperation = 'source-over';
  }
}

let lastFireTime = 0;
function fireLoop(timestamp) {
  if (!fireRunning) return;
  if (!lastFireTime) lastFireTime = timestamp;
  const dt = Math.min((timestamp - lastFireTime) / 1000, 0.05); // seconds
  lastFireTime = timestamp;
  stepFire(dt);
  fireAnimId = requestAnimationFrame(fireLoop);
}

function startFire() {
  if (!fireCtx || fireRunning) return;
  fireRunning = true;
  fireParticles = [];
  lastFireTime = 0;
  // clear canvas initially
  fireCtx.clearRect(0, 0, fireCanvas.width / dpr, fireCanvas.height / dpr);
  fireAnimId = requestAnimationFrame(fireLoop);
}

function stopFire() {
  fireRunning = false;
  lastFireTime = 0;
  if (fireAnimId) {
    cancelAnimationFrame(fireAnimId);
    fireAnimId = null;
  }
  // smooth fade out
  if (fireCtx && fireCanvas) {
    const w = fireCanvas.width / dpr;
    const h = fireCanvas.height / dpr;
    fireCtx.fillStyle = 'rgba(0,0,0,0.8)';
    fireCtx.fillRect(0, 0, w, h);
  }
}

/* ---------------------------
   LIGHTNING: improved from earlier code (start only when triggered)
   --------------------------- */
let ctx = lightningCanvas ? lightningCanvas.getContext('2d') : null;
let lightningRaf = null;
let lastStrike = 0;
let nextStrikeIn = Math.random() * (4500 - 800) + 800;
let lightningActive = false;

function drawLightningStrike() {
  if (!ctx || !lightningCanvas) return;
  const w = lightningCanvas.width / dpr;
  const h = lightningCanvas.height / dpr;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(125,249,255,0.95)";
  ctx.lineWidth = 2;
  let x = Math.random() * w;
  let y = 0;
  ctx.moveTo(x, y);
  while (y < h) {
    x += (Math.random() - 0.5) * 120;
    y += Math.random() * 40 + 20;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // occasional branching
  if (Math.random() > 0.6) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(200,255,255,0.6)";
    ctx.lineWidth = 1;
    let bx = Math.random() * w;
    let by = Math.random() * (h * 0.6);
    ctx.moveTo(bx, by);
    for (let i = 0; i < 5; i++) {
      bx += (Math.random() - 0.5) * 40;
      by += Math.random() * 40;
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }
}

function lightningStep(timestamp) {
  if (!ctx || !lightningCanvas) return;
  // fade previous frame
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, lightningCanvas.width / dpr, lightningCanvas.height / dpr);

  if (!lastStrike) lastStrike = timestamp;
  const elapsed = timestamp - lastStrike;
  if (elapsed > nextStrikeIn) {
    const flashes = Math.random() > 0.75 ? Math.floor(Math.random() * 3) + 1 : 1;
    for (let i = 0; i < flashes; i++) drawLightningStrike();
    lastStrike = timestamp;
    nextStrikeIn = Math.random() * (6000 - 1200) + 1200;
  }
  lightningRaf = requestAnimationFrame(lightningStep);
}

function startLightning() {
  if (!ctx || lightningActive) return;
  lightningActive = true;
  lastStrike = 0;
  lightningRaf = requestAnimationFrame(lightningStep);
}

function stopLightning() {
  lightningActive = false;
  lastStrike = 0;
  if (lightningRaf) {
    cancelAnimationFrame(lightningRaf);
    lightningRaf = null;
  }
  if (ctx && lightningCanvas) {
    ctx.clearRect(0, 0, lightningCanvas.width / dpr, lightningCanvas.height / dpr);
  }
}

/* ---------------------------
   Sequence: Fire -> Storm
   --------------------------- */
function runSequence() {
  if (prefersReduced) return; // don't auto-trigger if user prefers reduced motion
  // schedule fire
  setTimeout(async () => {
    // show fire
    startFire();
    // after FIRE_DURATION_MS stop fire and possibly start storm
    setTimeout(() => {
      stopFire();
      if (STORM_AFTER_FIRE) {
        startLightning();
      }
    }, FIRE_DURATION_MS);
  }, FIRE_DELAY_MS);
}

// Start lightning only on demand if you want (previously auto-started). We'll run the sequenced version.
if (!prefersReduced) {
  // make sure lightning canvas is cleared and sized
  if (lightningCanvas) {
    resizeCanvas(lightningCanvas);
    ctx && ctx.clearRect(0, 0, lightningCanvas.width / dpr, lightningCanvas.height / dpr);
  }
  if (fireCanvas) {
    resizeCanvas(fireCanvas);
    fireCtx && fireCtx.clearRect(0, 0, fireCanvas.width / dpr, fireCanvas.height / dpr);
  }
  // Start sequence
  runSequence();
}

/* ---------------------------
   Countdown (unchanged & robust)
   --------------------------- */
const countdown = document.getElementById('countdown');
let countdownTimer = null;

function parseTarget(el) {
  const targetAttr = el?.dataset?.target;
  if (targetAttr) {
    const parsed = Date.parse(targetAttr);
    if (!isNaN(parsed)) return parsed;
  }
  return Date.parse("Jan 25, 2025 09:00:00 GMT");
}

function formatTime(diff) {
  const abs = Math.abs(diff);
  const d = Math.floor(abs / (1000 * 60 * 60 * 24));
  const h = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const m = Math.floor((abs / (1000 * 60)) % 60);
  const s = Math.floor((abs / 1000) % 60);
  return { d, h, m, s };
}

function updateCountdown() {
  if (!countdown) return;
  const target = parseTarget(countdown);
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    const { d, h, m, s } = formatTime(diff);
    countdown.textContent = `Event has ended (${d}d ${h}h ${m}m ${s}s ago)`;
    clearInterval(countdownTimer);
    return;
  }
  const { d, h, m, s } = formatTime(diff);
  countdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
}

function startCountdown() {
  updateCountdown();
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (!document.hidden) updateCountdown();
  }, 1000);
}
startCountdown();

/* ---------------------------
   Intro behavior & register open
   --------------------------- */
const intro = document.getElementById('intro');
const enterBtn = document.getElementById('intro-enter');

function dismissIntro() {
  if (!intro || intro.getAttribute('aria-hidden') === 'true') return;
  intro.setAttribute('aria-hidden', 'true');
  intro.style.transition = 'opacity 400ms ease, visibility 400ms';
  intro.style.opacity = 0;
  setTimeout(() => {
    intro.style.display = 'none';
    const main = document.getElementById('main');
    if (main) main.focus();
  }, 450);
}

function openRegisterAndDismiss() {
  const registerUrl = 'register.html';
  const win = window.open(registerUrl, '_blank', 'noopener');
  if (!win) {
    // popup blocked — fallback to same tab
    window.location.href = registerUrl;
  }
  dismissIntro();
}

if (enterBtn) {
  enterBtn.addEventListener('click', openRegisterAndDismiss);
  enterBtn.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openRegisterAndDismiss();
  });
}

/* ---------------------------
   Mobile nav toggle (unchanged)
   --------------------------- */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.hidden = expanded;
  });
}
