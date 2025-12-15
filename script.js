// LIGHTNING EFFECT
const canvas = document.getElementById("lightning");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function lightning() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(125,249,255,0.7)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  let x = Math.random() * canvas.width;
  let y = 0;
  ctx.moveTo(x, y);

  while (y < canvas.height) {
    x += (Math.random() - 0.5) * 50;
    y += Math.random() * 30;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}
setInterval(lightning, 3000);

// COUNTDOWN TIMER
const target = new Date("Jan 25, 2025 09:00:00").getTime();
const countdown = document.getElementById("countdown");

setInterval(() => {
  const now = new Date().getTime();
  const diff = target - now;

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  countdown.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
}, 1000);
