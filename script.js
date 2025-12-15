// Subtle glow pulse
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = "0 0 20px #7df9ff";
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = "none";
  });
});
