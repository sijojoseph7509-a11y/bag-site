// Shared slide viewer: ← → / Space / PageUp-Down / wheel / swipe move one slide sideways. Esc goes back to the bag.
(() => {
  const track = document.querySelector('.track'), slides = [...track.children];
  const bar = document.querySelector('.prog i'), count = document.getElementById('count');
  const prev = document.querySelector('.nav.prev'), next = document.querySelector('.nav.next');
  const N = slides.length, back = document.body.dataset.back || '../';
  let i = Math.min(N - 1, Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));

  // load images just ahead of where you are, so the deck opens fast
  const warm = (k) => { for (let j = k - 1; j <= k + 2; j++) { if (!slides[j]) continue; slides[j].querySelectorAll('[data-src]').forEach((im) => { im.src = im.dataset.src; if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.removeAttribute('data-src'); }); slides[j].querySelectorAll('[data-bg]').forEach((el) => { el.style.backgroundImage = `url(${el.dataset.bg})`; el.removeAttribute('data-bg'); }); } };

  function go(k, instant) {
    i = Math.max(0, Math.min(N - 1, k));
    if (instant) { track.style.transition = 'none'; requestAnimationFrame(() => track.style.transition = ''); }
    track.style.transform = `translateX(${-i * 100}vw)`;
    bar.style.width = (N > 1 ? i / (N - 1) * 100 : 100) + '%';
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    prev.disabled = i === 0; next.disabled = i === N - 1;
    history.replaceState(null, '', '#' + (i + 1));
    warm(i);
    slides.forEach((sl, k) => { const on = k === i; if (sl.classList.contains('on') !== on) { sl.classList.toggle('on', on); sl.dispatchEvent(new CustomEvent(on ? 'enter' : 'leave')); } });
  }

  addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(i + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(i - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(N - 1);
    else if (e.key === 'Escape') location.href = back;
  });

  // one wheel gesture = one slide (trackpads fire many events, so wait for the gesture to settle)
  let lock = false, acc = 0, t;
  addEventListener('wheel', (e) => {
    e.preventDefault();
    acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    clearTimeout(t); t = setTimeout(() => { acc = 0; lock = false; }, 180);
    if (!lock && Math.abs(acc) > 30) { lock = true; go(i + (acc > 0 ? 1 : -1)); }
  }, { passive: false });

  let sx = null, sy = null;
  addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    const d = Math.abs(dx) > Math.abs(dy) ? dx : dy; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); sx = sy = null;
  });

  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));
  addEventListener('hashchange', () => { const k = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (k !== i) go(k); });
  go(i, true);
  // page scripts register their enter handlers after this file, so replay enter for the opening slide
  setTimeout(() => slides[i].dispatchEvent(new CustomEvent("enter")), 0);
})();
