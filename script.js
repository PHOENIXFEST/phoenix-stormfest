// Basic JS for countdown and simple interactions
(function(){
  // Toggle nav (simple prototype)
  const navToggle = document.querySelector('.nav-toggle');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      // hook for future mobile nav
      alert('Mobile nav toggle (prototype)')
    })
  }

  // Countdown to event start (local timezone)
  const countdownEl = document.getElementById('countdown');
  // Default start time: 25 Jan 2026 09:00 local
  const target = new Date('2026-01-25T09:00:00');
  function updateCountdown(){
    const now = new Date();
    let diff = target - now;
    if(diff <= 0){
      countdownEl.textContent = 'StormFest is live!';
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days*(1000*60*60*24);
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours*(1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    const secs = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s until kickoff`;
  }
  if(countdownEl) updateCountdown();
  setInterval(updateCountdown, 1000);
})();
