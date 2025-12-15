* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root{
  --accent: #7df9ff;
  --bg: #000;
  --muted: #777;
  --max-width: 1100px;
}

/* Basic page */
body {
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: var(--bg);
  color: white;
  overflow-x: hidden;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Skip link */
.skip {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip:focus {
  left: 1rem;
  top: 1rem;
  width: auto;
  height: auto;
  background: #111;
  color: var(--accent);
  padding: 8px 12px;
  z-index: 200;
  border-radius: 4px;
  text-decoration: none;
}

/* Canvas */
canvas#lightning {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* Intro overlay */
#intro {
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.96));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
#intro[aria-hidden="true"] { visibility: hidden; pointer-events: none; }
#intro h1 {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 5px;
  font-size: clamp(2rem, 6vw, 3rem);
}
#intro p { color: var(--accent); margin: 8px 0 18px; }
#intro #intro-enter {
  padding: 10px 18px;
  border: none;
  background: var(--accent);
  color: black;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
}
#intro #intro-enter:focus { outline: 3px solid rgba(125,249,255,0.25); }

/* Top nav */
.topnav {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 14px 20px;
  max-width: var(--max-width);
  margin: 0 auto;
  z-index: 10;
}
.logo { color: var(--accent); font-weight:700; text-decoration:none; }
.nav-toggle { display:none; background:transparent; color:var(--accent); border:1px solid rgba(255,255,255,0.04); padding:6px 10px; border-radius:4px; }

/* HERO */
.hero {
  min-height: 80vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: radial-gradient(circle at top, #1a1a2e, black);
  padding: 40px 20px;
  z-index: 1;
}
.hero h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 8vw, 3rem);
  line-height:1.05;
}
.hero span { color: var(--accent); }
.hero p { margin-top: 10px; color: var(--muted); }

/* Buttons */
.buttons {
  margin-top: 20px;
}
a.primary, .buttons a {
  display:inline-block;
  padding: 12px 26px;
  margin: 8px;
  text-decoration: none;
  font-weight: bold;
  background: var(--accent);
  color: black;
  border-radius: 8px;
  transition: transform .18s ease, box-shadow .18s ease;
}
a.primary:focus, .buttons a:focus { outline:3px solid rgba(125,249,255,0.2); }
a.primary:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(125,249,255,0.12); }

.buttons .outline {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
}

/* SECTIONS */
.section {
  padding: 64px 20px;
  text-align: center;
  max-width: var(--max-width);
  margin: 0 auto;
}
.section.dark { background: #050505; }
.section h3 { font-family: 'Orbitron', sans-serif; margin-bottom: 20px; font-size: clamp(1.25rem, 4vw, 1.8rem); }

/* Cards */
.cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.card {
  border: 1px solid var(--accent);
  padding: 22px;
  width: 220px;
  transition: transform .18s ease, box-shadow .18s ease;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15));
  border-radius: 8px;
}
.card span { color: var(--accent); }
.card:hover, .card:focus-within { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(125,249,255,0.08); }

/* COUNTDOWN */
#countdown {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.2rem, 3vw, 2rem);
  color: var(--accent);
}

/* Iframe wrapper (responsive) */
.iframe-wrap {
  max-width: 900px;
  margin: 18px auto 0;
  background: #050505;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}

/* FOOTER */
footer {
  padding: 20px;
  text-align: center;
  background: transparent;
  color: var(--muted);
}

/* Accessibility & focus */
a:focus, button:focus { outline: 3px solid rgba(125,249,255,0.15); outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }

/* Responsive adjustments */
@media (max-width: 720px) {
  .nav-toggle { display:block; }
  .nav-links { display:flex; flex-direction:column; gap:8px; }
  .card { width: 100%; max-width: 300px; }
  .hero { min-height: 60vh; }
}
