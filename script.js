// LIGHTNING EFFECT
const canvas = document.getElementById("lightning");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function drawLightning() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(125,249,255,0.8)";
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

setInterval(drawLightning, 3000);
