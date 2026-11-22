// Syntra deck: the moving parts of the portfolio case study (sijo.work, syntra-fx.js), placed on each slide in the
// documentation's own 1440-px page coordinates, so they line up with the Figma export underneath.
import * as THREE from "../../vendor/three.module.min.js";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const touch = matchMedia("(pointer: coarse)").matches;
const A = (f) => `fx/${f}`;
const img = (f, alt = "") => `<img src="${A(f)}" srcset="${A(f)} 1x, ${A(f.replace(/\.(\w+)$/, "@2x.$1"))} 2x" alt="${alt}" decoding="async">`;
const slides = [...document.querySelectorAll(".slide.sx")];

// every layer: page, class, x, y, w, h, html, (optional) setup(el, slide) -> {enter, leave}
const L = [];
const add = (page, cls, x, y, w, h, html, fx) => L.push({ page, cls, x, y, w, h, html, fx });

// 1 · cover: the bottle breathes, bottles drift, the line drifts in and out of focus
add("01", "sx-under sx-breathe", 0, 0, 1440, 2024, img("cover-bg.webp"));
add("01", "sx-under sx-drift", -555, 1598, 1449, 1127, img("cover-bottles.webp"));
add("01", "sx-mul sx-focus", 150, 1250, 1140, 180, img("find-text.webp", "Let's find your perfume."));
add("15", "sx-mul sx-focus", 150, 1265, 1140, 180, img("find-text.webp", "Let's find your perfume."));
// 2 · meet Syntra: the kiosk photo breathing in its light
add("02", "sx-mul sx-kenburns", 70, 350, 1300, 1000, img("meet-hero.webp", "A visitor in the VR headset at the Syntra kiosk."));

// 3 · how it works: the line draws itself, the knob and sliders move, weights grow, 162 counts up
const ANG = [-145, -90, -35, 35, 90, 145], KX = 360, KY = 1710;
const bars = [[36, "#E39A1B"], [26, "#D37A19"], [22, "#BD680F"], [16, "#975C1C"]].reduce((a, [v, c]) => {
  const w = 1072 * v / 100; a.s += `<rect x="${a.x}" y="2490" width="${w - 4}" height="14" rx="7" fill="${c}" style="--d:${a.k * .18}s"/>`; a.x += w; a.k++; return a; }, { s: "", x: 184, k: 0 }).s;
const howSVG = `<svg viewBox="0 0 1440 3300" aria-hidden="true"><defs>
 <linearGradient id="sxLine" x1="0" x2="1"><stop offset="0" stop-color="#F99C36"/><stop offset="1" stop-color="#593314"/></linearGradient>
 <linearGradient id="sxCap" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A3430"/><stop offset="1" stop-color="#141110"/></linearGradient>
 <radialGradient id="sxGlow"><stop offset="0" stop-color="#F99C36" stop-opacity=".55"/><stop offset="1" stop-color="#F99C36" stop-opacity="0"/></radialGradient></defs>
 <g class="sx-flow" fill="none" stroke="url(#sxLine)" stroke-linecap="round">
  <path pathLength="1" stroke-width="4" d="M 220 560 C 350 460 420 660 550 560 C 680 460 750 660 880 560 C 1010 460 1080 660 1210 560"/>
  <path pathLength="1" stroke-width="3" style="--d:1.9s" d="M 1210 560 C 1210 680 900 700 880 840"/>
  <path pathLength="1" stroke-width="3" style="--d:1.9s" d="M 1210 560 C 1290 650 1290 760 1210 840"/>
  <path pathLength="1" stroke-width="3" style="--d:2.6s" d="M 1210 840 C 1130 920 1130 1000 1210 1080"/></g>
 <g class="sx-dots">${[[220, 560, 0], [550, 560, .45], [880, 560, .9], [1210, 560, 1.35], [880, 840, 2.3], [1210, 840, 2.3], [1210, 1080, 3]].map(([x, y, d]) =>
  `<g style="--d:${d}s"><circle class="sx-ping" cx="${x}" cy="${y}" r="13" fill="none" stroke="#BD680F" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="#BD680F" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="5" fill="#BD680F"/></g>`).join("")}</g>
 <circle class="sx-knobglow" r="16" fill="url(#sxGlow)"/>
 <g class="sx-tick" style="transform-origin:${KX}px ${KY}px"><line x1="${KX}" y1="1690" x2="${KX}" y2="1655" stroke="#EADCCB" stroke-width="4" stroke-linecap="round"/></g>
 ${[588, 778, 968].map((x) => `<g class="sx-cap" style="--x:${x}px"><rect width="30" height="40" rx="4" fill="url(#sxCap)"/><rect x="4" y="19" width="22" height="2" fill="#E8E1D8"/></g>`).join("")}
 <g class="sx-bars">${bars}</g></svg>`;
add("08", "sx-svg", 0, 0, 1440, 3300, howSVG, (el) => {
  const tick = el.querySelector(".sx-tick"), glow = el.querySelector(".sx-knobglow"), caps = [...el.querySelectorAll(".sx-cap")];
  let mood = 2, steps = [0, 1, 0], t = 0;
  const set = () => { tick.style.transform = `rotate(${ANG[mood]}deg)`; const a = ANG[mood] * Math.PI / 180;
    glow.setAttribute("cx", KX + Math.sin(a) * 96); glow.setAttribute("cy", KY - Math.cos(a) * 96);
    caps.forEach((c, k) => c.style.transform = `translate(var(--x), ${1805 - 115 * steps[k]}px)`); };
  set();
  return { enter() { if (reduce) return; t = setInterval(() => { mood = (mood + 1) % 6; const k = Math.floor(Math.random() * 3); steps[k] = (steps[k] + 1 + Math.floor(Math.random() * 2)) % 3; set(); }, 1500); },
           leave() { clearInterval(t); } };
});
add("08", "sx-num", 184, 2140, 360, 220, `<span style="--fs:180">0</span>`, (el) => counter(el.firstChild, 162, 1600, 600));

// 4 · the screens: the kiosk plays its own sequence inside the hero screen
add("09", "sx-loop", 0, 360, 1440, 810, [0, 1, 2, 3, 4, 5, 6].map((k) => `<img src="${A(`loop-${k}.webp`)}" srcset="${A(`loop-${k}.webp`)} 960w, ${A(`loop-${k}@2x.webp`)} 1920w" sizes="100vw" alt="">`).join(""), (el) => {
  const hold = [2600, 2400, 2400, 1500, 1900, 1700, 5200]; let t = 0;
  return { enter() { if (reduce) return; const fr = [...el.children]; let k = 0;
      const next = () => { fr.forEach((f, j) => f.classList.toggle("on", j === k)); t = setTimeout(() => { k = (k + 1) % fr.length; next(); }, hold[k]); };
      el.classList.add("sx-run"); next(); },
    leave() { clearTimeout(t); el.classList.remove("sx-run"); } };
});

// 5 · step inside: the panorama strip becomes a live 360° view you can drag
const WORLDS = [["symmetrical_garden_02", "Flower garden"], ["bell_park_pier", "Lake pier"], ["autumn_forest_04", "Autumn forest"],
  ["rogland_clear_night", "Milky Way"], ["dry_orchard_meadow", "Orchard"], ["lago_disola", "Snowy Alps"],
  ["forest_slope", "Pine forest"], ["kiara_1_dawn", "Desert dawn"], ["lakeside_night", "Starry lake"], ["small_harbor_01", "Lobby"]];
add("10", "sx-vr", 0, 1480, 1440, 281, `<canvas aria-label="360 degree view of a Syntra VR world. Drag to look around."></canvas><p class="sx-vr-hint">Drag to look around</p>
 <div class="sx-vr-chips" role="group" aria-label="Choose a world">${WORLDS.map(([, n], k) => `<button type="button" data-w="${k}"${k ? "" : ' aria-pressed="true"'}>${n}</button>`).join("")}</div>`, (el) => {
  let vr = null;
  ["pointerdown", "wheel", "touchstart", "touchend"].forEach((ev) => el.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  return { enter() { if (!vr) { try { vr = startVR(el, WORLDS.map((w) => A(`pano-${w[0]}.webp`))); } catch (_) { el.style.display = "none"; } } else vr.run(true); },
           leave() { vr && vr.run(false); } };
});

// 6 · take it home: six tickets feed out of the printer, then 66 counts up
["164936", "165536", "170525", "174335", "200951", "140032"].forEach((r, k) =>
  add("11", "sx-ticket", 110 + k * 208, 400, 192, 562, `<img src="${A(`receipt-${r}.webp`)}" alt="">`, (el) => { el.style.setProperty("--d", k * .32 + "s"); }));
add("11", "sx-num", 760, 1520, 300, 180, `<span style="--fs:140">0</span>`, (el) => counter(el.firstChild, 66, 1400, 2300));

function counter(span, to, ms, delay) {
  let t = 0, raf = 0;
  return { enter() { if (reduce) { span.textContent = to; return; } span.textContent = 0;
      t = setTimeout(() => { const t0 = performance.now(); const st = (n) => { const p = Math.min(1, (n - t0) / ms); span.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(st); }; raf = requestAnimationFrame(st); }, delay); },
    leave() { clearTimeout(t); cancelAnimationFrame(raf); } };
}

// place layers on every slide cut from their page (the stage clips what falls outside)
slides.forEach((sl) => {
  const st = sl.querySelector(".stage"), d = sl.dataset, x = +d.x, y = +d.y, w = +d.w, h = +d.h, hooks = [];
  if (d.page === "01") st.classList.add("sx-stack");
  L.filter((l) => l.page === d.page && l.y < y + h && l.y + l.h > y && l.x < x + w && l.x + l.w > x).forEach((l) => {
    const el = document.createElement("div"); el.className = "sx-layer " + l.cls; el.innerHTML = l.html;
    Object.assign(el.style, { left: (l.x - x) / w * 100 + "%", top: (l.y - y) / h * 100 + "%", width: l.w / w * 100 + "%", height: l.h / h * 100 + "%" });
    st.appendChild(el); const hk = l.fx && l.fx(el, sl); if (hk) hooks.push(hk);
  });
  new ResizeObserver(() => st.style.setProperty("--u", st.clientWidth / w + "px")).observe(st);
  sl.addEventListener("enter", () => { st.classList.remove("sx-go"); void st.offsetWidth; st.classList.add("sx-go"); hooks.forEach((k) => k.enter && k.enter()); });
  sl.addEventListener("leave", () => { st.classList.remove("sx-go"); hooks.forEach((k) => k.leave && k.leave()); });
});
// deck.js fires enter for the opening slide before this module runs: replay it
const cur = document.querySelector(".slide.on"); if (cur) cur.dispatchEvent(new CustomEvent("enter"));

function startVR(host, urls) {
  const canvas = host.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 4, .1, 1100);
  const geo = new THREE.SphereGeometry(500, 96, 48); geo.scale(-1, 1, 1);
  const matl = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }); scene.add(new THREE.Mesh(geo, matl));
  const loader = new THREE.TextureLoader(), cache = {};
  let lon = 90, lat = -4, vlon = 0, drag = false, px = 0, py = 0, last = 0, cur = -1, fade = 0, on = true;
  const size = () => { const r = host.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.fov = Math.min(70, 40 * Math.max(1, 3.6 / camera.aspect)); camera.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(host); size();
  function show(k) { if (k === cur) return; cur = k;
    host.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.w === k)));
    const go = (t) => { if (cur !== k) return; matl.map = t; matl.needsUpdate = true; fade = 0; };
    if (cache[k]) return go(cache[k]);
    loader.load(urls[k], (t) => { t.colorSpace = THREE.SRGBColorSpace; cache[k] = t; go(t); }); }
  host.addEventListener("click", (e) => { const b = e.target.closest("[data-w]"); if (b) { show(+b.dataset.w); lon = 90; } });
  canvas.addEventListener("pointerdown", (e) => { drag = true; px = e.clientX; py = e.clientY; vlon = 0; canvas.setPointerCapture(e.pointerId); host.classList.add("sx-dragging"); });
  canvas.addEventListener("pointermove", (e) => { if (!drag) return; const k = camera.fov / host.clientHeight; const dx = (px - e.clientX) * k, dy = (e.clientY - py) * k; lon += dx; lat += dy; vlon = dx; px = e.clientX; py = e.clientY; last = performance.now(); });
  const up = () => { drag = false; host.classList.remove("sx-dragging"); };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  show(0);
  const target = new THREE.Vector3(); let prev = performance.now();
  (function tick(now) { requestAnimationFrame(tick); if (!on) { prev = now; return; }
    const dt = Math.min(.05, (now - prev) / 1000); prev = now;
    if (!drag) { lon += vlon; vlon *= .92; if (!reduce && now - last > 2500) lon += 2.4 * dt; }
    lat = Math.max(-35, Math.min(35, lat)); fade = Math.min(1, fade + dt * 1.6); matl.opacity = fade;
    const phi = THREE.MathUtils.degToRad(90 - lat), th = THREE.MathUtils.degToRad(lon);
    target.set(500 * Math.sin(phi) * Math.cos(th), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(th)); camera.lookAt(target); renderer.render(scene, camera);
  })(prev);
  return { run(v) { on = v; } };
}

// perfume motes rising through the deck, and a warm lantern under the pointer
if (!reduce) {
  const cv = document.createElement("canvas"); cv.className = "sx-motes"; document.body.appendChild(cv);
  const lamp = document.createElement("div"); lamp.className = "sx-lamp"; if (!touch) document.body.appendChild(lamp);
  const g = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2); let w = 0, h = 0;
  const sp = document.createElement("canvas"); sp.width = sp.height = 64; const sg = sp.getContext("2d"), rg = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, "rgba(249,156,54,.9)"); rg.addColorStop(.35, "rgba(227,154,27,.35)"); rg.addColorStop(1, "rgba(218,179,118,0)"); sg.fillStyle = rg; sg.fillRect(0, 0, 64, 64);
  const fit = () => { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; }; fit(); addEventListener("resize", fit);
  const spawn = (any) => ({ x: Math.random() * w, y: any ? Math.random() * h : h + 20, r: 3 + Math.random() * 9, s: 6 + Math.random() * 16, a: .12 + Math.random() * .35, ph: Math.random() * 6.28, sw: 8 + Math.random() * 22 });
  const P = Array.from({ length: touch ? 26 : 46 }, () => spawn(true));
  let mx = -999, my = -999, lx = -999, ly = -999, prev = performance.now();
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  (function frame(t) { requestAnimationFrame(frame); const dt = Math.min(.05, (t - prev) / 1000); prev = t;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    for (const p of P) { p.y -= p.s * dt; p.ph += dt * .6; const x = p.x + Math.sin(p.ph) * p.sw; if (p.y < -30) Object.assign(p, spawn(false));
      g.globalAlpha = p.a * (.6 + .4 * Math.sin(p.ph * 1.7)); g.drawImage(sp, x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
    if (!touch && mx > -999) { if (lx < -900) { lx = mx; ly = my; } lx += (mx - lx) * .08; ly += (my - ly) * .08; lamp.style.transform = `translate(${lx}px,${ly}px)`; lamp.classList.add("on"); }
  })(prev);
}
