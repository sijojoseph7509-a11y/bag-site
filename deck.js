// Shared slide viewer: ← → / Space / PageUp-Down / wheel / swipe move one slide sideways. Esc goes back to the bag.
(() => {
  const track = document.querySelector('.track'), slides = [...track.children];
  const bar = document.querySelector('.prog i'), count = document.getElementById('count');
  const prev = document.querySelector('.nav.prev'), next = document.querySelector('.nav.next');
  const N = slides.length, back = document.body.dataset.back || '../', nextProject = document.body.dataset.next, prevProject = document.body.dataset.prev;
  let i = Math.min(N - 1, Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));

  // load images just ahead of where you are, so the deck opens fast
  const warm = (k) => { for (let j = k - 1; j <= k + 2; j++) { if (!slides[j]) continue; slides[j].querySelectorAll('[data-src]').forEach((im) => { im.src = im.dataset.src; if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.removeAttribute('data-src'); }); slides[j].querySelectorAll('[data-bg]').forEach((el) => { el.style.backgroundImage = `url(${el.dataset.bg})`; el.removeAttribute('data-bg'); }); } };

  function go(k, instant) {
    if (k >= N && nextProject && !instant) { location.href = nextProject; return; }
    // ← on the first slide goes back to the previous project, landing on its last slide (the bag itself has no slides)
    if (k < 0 && prevProject && !instant) { location.href = prevProject + (/\.\.\/$/.test(prevProject) && prevProject.split('/').filter(Boolean).every((x) => x === '..') ? '' : '#999'); return; }
    i = Math.max(0, Math.min(N - 1, k));
    if (instant) { track.style.transition = 'none'; requestAnimationFrame(() => track.style.transition = ''); }
    track.style.transform = `translateX(${-i * 100}vw)`;
    bar.style.width = (N > 1 ? i / (N - 1) * 100 : 100) + '%';
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    prev.disabled = i === 0 && !prevProject; next.disabled = i === N - 1 && !nextProject;
    next.setAttribute('aria-label', i === N - 1 && nextProject ? (nextProject === '../' || nextProject === '../../' ? 'Back to the bag' : 'Next project') : 'Next slide');
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


  // full screen: show the top bar or the progress line only while the pointer is near it (a touch shows both briefly)
  let uiT;
  addEventListener('mousemove', (e) => { document.body.classList.toggle('ui-top', e.clientY < 90); document.body.classList.toggle('ui-bottom', e.clientY > innerHeight - 90); });
  document.addEventListener('mouseleave', () => document.body.classList.remove('ui-top', 'ui-bottom'));
  addEventListener('touchstart', () => { document.body.classList.add('ui-top', 'ui-bottom'); clearTimeout(uiT); uiT = setTimeout(() => document.body.classList.remove('ui-top', 'ui-bottom'), 2500); }, { passive: true });
  // each picture slide takes the colour of its own picture's edge, so it runs edge to edge with no bars
  const edge = (im) => { try { const c = document.createElement('canvas'); c.width = c.height = 2; const g = c.getContext('2d'), w = im.naturalWidth, h = im.naturalHeight, s = Math.max(2, Math.round(Math.min(w, h) * .01));
    // colour of the picture's own margin: its four corners (a row average would mix in the photo and turn grey)
    [[0, 0], [w - s, 0], [0, h - s], [w - s, h - s]].forEach(([x, y], k) => g.drawImage(im, x, y, s, s, k % 2, k >> 1, 1, 1));
    const d = g.getImageData(0, 0, 2, 2).data; let r = 0, gg = 0, b = 0; for (let k = 0; k < 16; k += 4) { r += d[k]; gg += d[k + 1]; b += d[k + 2]; }
    r /= 4; gg /= 4; b /= 4; if (Math.min(r, gg, b) > 226) r = gg = b = 255;   // a white margin stays pure white
    if (!im.parentElement.dataset.bg) im.parentElement.style.background = `rgb(${r | 0},${gg | 0},${b | 0})`; } catch (_) {} };
  const fit = (im) => { if (!im.naturalWidth) return; const r = im.naturalWidth / im.naturalHeight, s = innerWidth / innerHeight; im.classList.toggle('cover', Math.abs(r - s) / Math.max(r, s) < .13); };
  const ready = (im) => { edge(im); fit(im); };
  const pics = slides.map((sl) => sl.querySelector(':scope > img:not(.obj)')).filter(Boolean);
  pics.forEach((im) => { if (im.complete && im.naturalWidth) ready(im); else im.addEventListener('load', () => ready(im), { once: true }); });
  addEventListener('resize', () => pics.forEach(fit));


  // ── speed: load every slide in the background (nearest first) and decode it before it is shown ──
  const fire = (im) => {
    if (im.dataset.src) { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); }
    const loaded = (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((r) => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); setTimeout(r, 15000); });
    return loaded.then(() => Promise.race([im.decode ? im.decode().catch(() => {}) : 0, new Promise((r) => setTimeout(r, 400))]));
  };
  const prep = (sl) => Promise.all([...sl.querySelectorAll('img')].map(fire));
  let queued = false;
  const preloadAll = () => {
    if (queued) return; queued = true;
    const order = slides.map((sl, k) => [Math.abs(k - i) + (k < i ? .5 : 0), sl]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    let n = 0; const next = () => { const sl = order[n++]; if (!sl) return; prep(sl).then(next); };
    for (let c = 0; c < 6; c++) next();
  };
  if (document.readyState === 'complete') setTimeout(preloadAll, 300); else addEventListener('load', () => setTimeout(preloadAll, 300));
  setTimeout(preloadAll, 2500);
  // keep every slide in an offline cache, so a project that was opened once opens instantly afterwards
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(new URL('sw.js', document.querySelector('script[src*="deck.js"]').src).href).catch(() => {});

  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));
  addEventListener('hashchange', () => { const k = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (k !== i) go(k); });
  go(i, true);
  // page scripts register their enter handlers after this file, so replay enter for the opening slide
  setTimeout(() => slides[i].dispatchEvent(new CustomEvent("enter")), 0);
})();
