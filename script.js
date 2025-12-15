// HERO-localized fire -> storm sequence
// Canvases are inside .hero-banner and sized to that element (ResizeObserver used).
// Adjust timing as needed.

const FIRE_DELAY_MS = 8000;
const FIRE_DURATION_MS = 6000;
const STORM_AFTER_FIRE = true;

const heroBanner = document.querySelector('.hero-banner');
const fireCanvas = heroBanner?.querySelector('#fire') ?? null;
const lightningCanvas = heroBanner?.querySelector('#lightning') ?? null;

let dpr = Math.max(window.devicePixelRatio || 1, 1);
function resizeToHero(canvas) {
  if (!canvas || !heroBanner) return;
  dpr = Math.max(window.devicePixelRatio || 1, 1);
  const rect = heroBanner.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// initial resize and keep in sync
if (fireCanvas) resizeToHero(fireCanvas);
if (lightningCanvas) resizeToHero(lightningCanvas);

if (heroBanner && (fireCanvas || lightningCanvas)) {
  // observe size changes of the hero banner
  const ro = new ResizeObserver(() => {
    if (fireCanvas) resizeToHero(fireCanvas);
    if (lightningCanvas) resizeToHero(lightningCanvas);
  });
  ro.observe(heroBanner);
}

// respect reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  if (fireCanvas) fireCanvas.style.display = 'none';
  if (lightningCanvas) lightningCanvas.style.display = 'none';
}

/* ---------- FIRE (localized to hero) ---------- */
let fireCtx = fireCanvas ? fireCanvas.getContext('2d') : null;
let fireAnimId = null;
let fireParticles = [];
let fireRunning = false;

function createFireParticle(x, y) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 0.8,
    vy: - (Math.random() * 1.8 + 0.6),
    life: Math.random() * 1.2 + 0.6,
    age: 0,
    size: Math.random() * 18 + 8,
    hue: Math.random() * 30 + 20
  };
}

function stepFire(dt) {
  if (!fireCtx || !fireCanvas || !heroBanner) return;
  const w = fireCanvas.width / dpr;
  const h = fireCanvas.height / dpr;

  // gentle fade => low alpha so it doesn't black out the banner
  fireCtx.fillStyle = 'rgba(0,0,0,0.12)';
  fireCtx.fillRect(0, 0, w, h);

  // spawn particles near bottom center of hero
  const spawnRate = 5;
  for (let i = 0; i < spawnRate; i++) {
    const px = w * (0.45 + Math.random() * 0.1);
    const py = h * (0.88 + Math.random() * 0.08);
    fireParticles.push(createFireParticle(px, py));
    if (fireParticles.length > 600) fireParticles.shift();
  }

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

    const grad = fireCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    const hue = Math.floor(p.hue);
    grad.addColorStop(0, `hsla(${hue},100%,65%,${alpha})`);
    grad.addColorStop(0.4, `hsla(${hue+20},90%,50%,${alpha*0.7})`);
    grad.addColorStop(0.8, `hsla(${hue+40},80%,40%,${alpha*0.35})`);
    grad.addColorStop(1, `hsla(${hue+40},80%,30%,0)`);

    fireCtx.globalCompositeOperation = 'lighter';
    fireCtx.fillStyle = grad;
    fireCtx.beginPath();
    fireCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
    fireCtx.fill();
    fireCtx.globalCompositeOperation = 'source-over';
  }
}

let lastFireTime = 0;
function fireLoop(ts) {
  if (!fireRunning) return;
  if (!lastFireTime) lastFireTime = ts;
  const dt = Math.min((ts - lastFireTime) / 1000, 0.05);
  lastFireTime = ts;
  stepFire(dt);
  fireAnimId = requestAnimationFrame(fireLoop);
}

function startFire() {
  if (!fireCtx || fireRunning) return;
  fireRunning = true;
  fireParticles = [];
  lastFireTime = 0;
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
  if (fireCtx && fireCanvas) {
    fireCtx.clearRect(0, 0, fireCanvas.width / dpr, fireCanvas.height / dpr);
    fireParticles = [];
  }
}

/* ---------- LIGHTNING (localized to hero) ---------- */
let lightningCtx = lightningCanvas ? lightningCanvas.getContext('2d') : null;
let lightningRaf = null;
let lastStrike = 0;
let nextStrikeIn = Math.random() * (4500 - 800) + 800;
let lightningActive = false;

function drawLightningStrikeLocal() {
  if (!lightningCtx || !lightningCanvas) return;
  const w = lightningCanvas.width / dpr;
  const h = lightningCanvas.height / dpr;
  lightningCtx.beginPath();
  lightningCtx.strokeStyle = "rgba(180,230,255,0.95)";
  lightningCtx.lineWidth = 1.6;
  let x = Math.random() * w;
  let y = 0;
  lightningCtx.moveTo(x, y);
  while (y < h) {
    x += (Math.random() - 0.5) * 120;
    y += Math.random() * 40 + 20;
    lightningCtx.lineTo(x, y);
  }
  lightningCtx.stroke();

  if (Math.random() > 0.6) {
    lightningCtx.beginPath();
    lightningCtx.strokeStyle = "rgba(220,245,255,0.6)";
    lightningCtx.lineWidth = 1;
    let bx = Math.random() * w;
    let by = Math.random() * (h * 0.6);
    lightningCtx.moveTo(bx, by);
    for (let i = 0; i < 5; i++) {
      bx += (Math.random() - 0.5) * 40;
      by += Math.random() * 40;
      lightningCtx.lineTo(bx, by);
    }
    lightningCtx.stroke();
  }
}

function lightningStep(ts) {
  if (!lightningCtx || !lightningCanvas) return;
  // very subtle fade so lines persist briefly but don't hide image
  lightningCtx.fillStyle = 'rgba(0,0,0,0.04)';
  lightningCtx.fillRect(0, 0, lightningCanvas.width / dpr, lightningCanvas.height / dpr);

  if (!lastStrike) lastStrike = ts;
  const elapsed = ts - lastStrike;
  if (elapsed > nextStrikeIn) {
    const flashes = Math.random() > 0.75 ? Math.floor(Math.random() * 3) + 1 : 1;
    for (let i = 0; i < flashes; i++) drawLightningStrikeLocal();
    lastStrike = ts;
    nextStrikeIn = Math.random() * (6000 - 1200) + 1200;
  }
  lightningRaf = requestAnimationFrame(lightningStep);
}

function startLightning() {
  if (!lightningCtx || lightningActive) return;
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
  if (lightningCtx && lightningCanvas) {
    lightningCtx.clearRect(0, 0, lightningCanvas.width / dpr, lightningCanvas.height / dpr);
  }
}

/* ---------- Sequence ---------- */
function runSequence() {
  if (prefersReduced) return;
  setTimeout(() => {
    startFire();
    setTimeout(() => {
      stopFire();
      if (STORM_AFTER_FIRE) startLightning();
    }, FIRE_DURATION_MS);
  }, FIRE_DELAY_MS);
}

// start sequence if canvases present
if (!prefersReduced && heroBanner && (fireCanvas || lightningCanvas)) {
  runSequence();
}

/* ---------- Countdown (unchanged) ---------- */
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

/* ---------- Intro & register open ---------- */
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

/* ---------- Visibility handling ---------- */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopFire();
    stopLightning();
  } else {
    if (lightningActive && !prefersReduced) startLightning();
  }
});
