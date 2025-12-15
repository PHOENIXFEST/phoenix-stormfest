// Improved lightning canvas + accessible countdown + open-register behavior

// --- Canvas Lightning Effect (requestAnimationFrame, DPR-aware, pause when not visible) ---
const canvas = document.getElementById("lightning");
const ctx = canvas?.getContext ? canvas.getContext("2d") : null;
let rafId = null;
let lastStrike = 0;
let nextStrikeIn = Math.random() * (4500 - 800) + 800;
let devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1);

function resizeCanvas() {
  if (!canvas || !ctx) return;
  devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * devicePixelRatio);
  canvas.height = Math.floor(h * devicePixelRatio);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resizeCanvas();

let fading = 0.06; // background fade to create trails

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Draw a single lightning strike
function drawStrike() {
  if (!ctx) return;
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(125,249,255,0.9)";
  ctx.lineWidth = 1.5;
  let x = Math.random() * w;
  let y = 0;
  ctx.moveTo(x, y);
  while (y < h) {
    x += (Math.random() - 0.5) * 80;
    y += randomRange(20, 60);
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // occasional branches
  if (Math.random() > 0.6) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(200,255,255,0.6)";
    ctx.lineWidth = 1;
    let bx = Math.random() * w;
    let by = randomRange(h * 0.2, h * 0.6);
    ctx.moveTo(bx, by);
    for (let i = 0; i < 6; i++) {
      bx += (Math.random() - 0.5) * 30;
      by += randomRange(10, 40);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }
}

function step(timestamp) {
  if (!ctx) return;
  // fade previous frame (creates trailing/fade effect)
  ctx.fillStyle = `rgba(0,0,0,${fading})`;
  ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

  if (!lastStrike) lastStrike = timestamp;
  const elapsed = timestamp - lastStrike;
  if (elapsed > nextStrikeIn) {
    // simulate multiple quick flashes sometimes
    const flashes = Math.random() > 0.75 ? Math.floor(randomRange(1, 4)) : 1;
    for (let i = 0; i < flashes; i++) {
      drawStrike();
    }
    lastStrike = timestamp;
    nextStrikeIn = randomRange(1200, 6000);
  }
  rafId = requestAnimationFrame(step);
}

function startLightning() {
  if (!rafId && ctx) {
    rafId = requestAnimationFrame(step);
  }
}
function stopLightning() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Visibility handling to save CPU
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopLightning();
  else startLightning();
});

// Debounced resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
  }, 150);
});

// Respect prefers-reduced-motion
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced) startLightning();

// --- Intro dismiss and open register page in new tab ---
const intro = document.getElementById("intro");
const enterBtn = document.getElementById("intro-enter");

function dismissIntro() {
  if (!intro || intro.getAttribute("aria-hidden") === "true") return;
  intro.setAttribute("aria-hidden", "true");
  intro.style.transition = "opacity 400ms ease, visibility 400ms";
  intro.style.opacity = 0;
  setTimeout(() => {
    intro.style.display = "none";
    const main = document.getElementById("main");
    if (main) main.focus();
  }, 450);
}

function openRegisterAndDismiss() {
  // open register page in a new tab/window; use noopener for security
  const registerUrl = "register.html";
  try {
    window.open(registerUrl, "_blank", "noopener");
  } catch (e) {
    // fallback: navigate (same tab) if blocked by popup blocker
    window.location.href = registerUrl;
  }
  dismissIntro();
}

if (enterBtn) {
  enterBtn.addEventListener("click", (e) => {
    openRegisterAndDismiss();
  });
  // allow keyboard activation (Enter/Space)
  enterBtn.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") openRegisterAndDismiss();
  });
}

// --- Simple nav toggle for mobile ---
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    if (expanded) {
      navLinks.hidden = true;
    } else {
      navLinks.hidden = false;
    }
  });
}

// --- Countdown (robust, handles past dates and updates via data-target attribute) ---
const countdownEl = document.getElementById("countdown");
let countdownTimer = null;

function parseTarget(el) {
  const targetAttr = el?.dataset?.target;
  if (targetAttr) {
    const parsed = Date.parse(targetAttr);
    if (!isNaN(parsed)) return parsed;
  }
  // fallback original date (kept for backwards compatibility)
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
  if (!countdownEl) return;
  const target = parseTarget(countdownEl);
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    const { d, h, m, s } = formatTime(diff);
    countdownEl.textContent = `Event has ended (${d}d ${h}h ${m}m ${s}s ago)`;
    clearInterval(countdownTimer);
    return;
  }
  const { d, h, m, s } = formatTime(diff);
  countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
}

function startCountdown() {
  updateCountdown();
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (!document.hidden) updateCountdown();
  }, 1000);
}
startCountdown();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (countdownTimer) clearInterval(countdownTimer);
    stopLightning();
  } else {
    startCountdown();
    if (!prefersReduced) startLightning();
  }
});
