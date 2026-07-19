/* ==========================================================================
   DAILY AI SOLUTIONS — INK & SIGNAL ENGINE
   Lenis smooth scroll · GSAP choreography · click-to-stage gallery ·
   damped pinned film scrub · zone color shifts · custom cursor
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

/* ============ LENIS ============ */
const lenis = new Lenis({
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ============ ZONE PALETTES ============ */
const ZONES = {
  cream: { bg: "#F2EEE4", fg: "#12140F", mute: "rgba(18,20,15,0.62)", line: "rgba(18,20,15,0.16)" },
  ink:   { bg: "#12140F", fg: "#F2EEE4", mute: "rgba(242,238,228,0.64)", line: "rgba(242,238,228,0.16)" },
  orange:{ bg: "#FF4C1F", fg: "#12140F", mute: "rgba(18,20,15,0.66)", line: "rgba(18,20,15,0.22)" },
};
function setZone(name) {
  const z = ZONES[name] || ZONES.cream;
  document.body.dataset.zone = name;
  gsap.to(document.documentElement, {
    "--zone-bg": z.bg, "--zone-fg": z.fg, "--zone-mute": z.mute, "--zone-line": z.line,
    duration: 0.7, ease: "power2.inOut", overwrite: "auto",
  });
}
document.querySelectorAll("[data-zone]").forEach((sec) => {
  if (sec === document.body) return;
  ScrollTrigger.create({
    trigger: sec,
    start: "top 55%",
    end: "bottom 55%",
    onEnter: () => setZone(sec.dataset.zone),
    onEnterBack: () => setZone(sec.dataset.zone),
  });
});

/* ============ LOADER ============ */
const loader = document.getElementById("loader");
const loaderPercent = document.getElementById("loader-percent");
let pct = 0;
const loaderTimer = setInterval(() => {
  pct = Math.min(100, pct + Math.random() * 16 + 7);
  loaderPercent.textContent = String(Math.floor(pct)).padStart(2, "0");
  if (pct >= 100) {
    clearInterval(loaderTimer);
    setTimeout(() => {
      loader.classList.add("hidden");
      heroIntro();
    }, 300);
  }
}, 120);

/* ============ HERO INTRO ============ */
function heroIntro() {
  gsap.set(".hero-title .ht-word", { yPercent: 110, rotate: 2 });
  gsap.to(".hero-title .ht-word", {
    yPercent: 0, rotate: 0, duration: 1.25, stagger: 0.09, ease: "power4.out",
  });
  gsap.from([".hero .kicker", ".hero-tagline", ".scroll-cue", ".stamp", ".ticker"], {
    opacity: 0, y: 20, duration: 0.9, delay: 0.45, stagger: 0.1, ease: "power3.out",
  });
  gsap.from(".site-header", { opacity: 0, y: -14, duration: 0.8, delay: 0.6 });
}

/* hero title drifts up + fades slightly as you leave */
gsap.to(".hero-title", {
  yPercent: -12, opacity: 0.25, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});

/* ============ HEADER STATE ============ */
const header = document.querySelector(".site-header");
ScrollTrigger.create({
  start: 10, end: "max",
  onUpdate: () => header.classList.add("scrolled"),
  onLeaveBack: () => header.classList.remove("scrolled"),
});

/* ============ SPLIT-LINE + FADE REVEALS ============ */
document.querySelectorAll(".split-lines").forEach((el) => {
  const lines = el.querySelectorAll(".sl");
  gsap.set(lines, { yPercent: 105, opacity: 0 });
  ScrollTrigger.create({
    trigger: el, start: "top 78%",
    onEnter: () => gsap.to(lines, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.09, ease: "power4.out" }),
    once: true,
  });
});

const FADE_TARGETS = [
  ".kicker", ".section-title", ".gallery-note", ".service-row", ".step",
  ".price-line", ".pc-head", ".cta-body", ".cta-actions", ".contact-strip",
  ".leak-figure", ".stage-meta", ".rail .thumb", ".stat",
];
FADE_TARGETS.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el) => {
    gsap.set(el, { opacity: 0, y: 44 });
    ScrollTrigger.create({
      trigger: el, start: "top 86%",
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" }),
      once: true,
    });
  });
});

/* CTA giant words */
document.querySelectorAll(".cta-title .ht-word").forEach((w) => gsap.set(w, { yPercent: 110 }));
ScrollTrigger.create({
  trigger: ".cta-title", start: "top 80%",
  onEnter: () => gsap.to(".cta-title .ht-word", { yPercent: 0, duration: 1.2, stagger: 0.12, ease: "power4.out" }),
  once: true,
});

/* ============ COUNTERS ============ */
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseFloat(el.dataset.value);
  ScrollTrigger.create({
    trigger: el, start: "top 85%",
    onEnter: () => gsap.fromTo(el, { textContent: 0 }, {
      textContent: target, duration: 1.9, ease: "power1.out", snap: { textContent: 1 },
    }),
    once: true,
  });
});

/* ============ STAGE POP-IN (scroll-stopping image entrance) ============ */
document.querySelectorAll(".reveal-img .stage-media").forEach((el) => {
  ScrollTrigger.create({
    trigger: el, start: "top 80%",
    onEnter: () => gsap.to(el, {
      clipPath: "inset(0% 0% 0% 0% round 16px)", scale: 1,
      duration: 1.3, ease: "power4.inOut",
    }),
    once: true,
  });
  /* subtle parallax inside the stage */
  gsap.fromTo("#stage-img", { yPercent: -6 }, {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
  });
});

/* ============ INTERACTIVE GALLERY — CLICK TO STAGE ============ */
const stageImg = document.getElementById("stage-img");
const stageTag = document.getElementById("stage-tag");
const stageTitle = document.getElementById("stage-title");
const stageNote = document.getElementById("stage-note");
const thumbs = Array.from(document.querySelectorAll(".thumb"));
let galleryBusy = false;

/* preload all gallery sources so swaps are instant */
thumbs.forEach((t) => { const i = new Image(); i.src = t.dataset.src; });

function stageSwap(btn) {
  if (galleryBusy || btn.classList.contains("is-active")) return;
  galleryBusy = true;

  thumbs.forEach((t) => t.classList.remove("is-active"));
  btn.classList.add("is-active");

  const tl = gsap.timeline({ onComplete: () => (galleryBusy = false) });

  /* out: wipe down + slight zoom */
  tl.to(stageImg, {
    clipPath: "inset(0% 0% 100% 0%)", scale: 1.08, duration: 0.38, ease: "power3.in",
  });
  tl.to([stageTag, stageTitle, stageNote], {
    opacity: 0, y: -14, duration: 0.28, stagger: 0.04, ease: "power2.in",
  }, "<");

  /* swap content at the midpoint */
  tl.add(() => {
    stageImg.src = btn.dataset.src;
    stageImg.alt = `${btn.dataset.title} — AI-generated concept sample`;
    stageTag.innerHTML = btn.dataset.tag;
    stageTitle.textContent = btn.dataset.title;
    stageNote.innerHTML = btn.dataset.note;
  });

  /* in: pop — reveal up + settle from 1.15 */
  tl.fromTo(stageImg,
    { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 },
    { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.85, ease: "power4.out" });
  tl.fromTo([stageTag, stageTitle, stageNote],
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" }, "-=0.5");
}

thumbs.forEach((btn) => {
  btn.addEventListener("click", () => stageSwap(btn));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stageSwap(btn); }
  });
});

/* ============ FILM — PINNED, DAMPED FRAME SCRUB ============ */
const FILM = {
  chapters: [
    { dir: "media/frames-listing", count: 76, label: "LISTINGLIFT — AI GENERATED SAMPLE FILM", vertical: false },
    { dir: "media/frames-food",    count: 76, label: "PLATESTORY — AI GENERATED SAMPLE FILM",  vertical: true  },
    { dir: "media/frames-launch",  count: 76, label: "LAUNCHFRAME — AI GENERATED SAMPLE FILM", vertical: false },
  ],
  frames: [[], [], []],
};
const filmCanvas = document.getElementById("film-canvas");
const fctx = filmCanvas.getContext("2d");
const filmIndex = document.getElementById("film-index");
const filmLabel = document.getElementById("film-label");
const filmFill = document.getElementById("film-progress-fill");
const chapterEls = Array.from(document.querySelectorAll(".chapter"));

function resizeFilmCanvas() {
  const r = filmCanvas.parentElement.getBoundingClientRect();
  const d = Math.min(window.devicePixelRatio || 1, 2);
  filmCanvas.width = r.width * d;
  filmCanvas.height = r.height * d;
  fctx.setTransform(d, 0, 0, d, 0, 0);
  filmState.dirty = true;
}
window.addEventListener("resize", resizeFilmCanvas);

function loadFilmFrames() {
  FILM.chapters.forEach((ch, ci) => {
    for (let i = 1; i <= ch.count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${ch.dir}/frame_${String(i).padStart(3, "0")}.webp`;
      img.onload = () => { if (img.decode) img.decode().catch(() => {}); filmState.dirty = true; };
      FILM.frames[ci][i - 1] = img;
    }
  });
}
if ("requestIdleCallback" in window) requestIdleCallback(loadFilmFrames, { timeout: 3000 });
else setTimeout(loadFilmFrames, 1800);

const filmTarget = { p: 0, active: false };
const filmState = { frame: 0, ci: 0, dirty: true };
const lerp = (a, b, t) => a + (b - a) * t;

ScrollTrigger.create({
  trigger: ".film",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onToggle: (self) => (filmTarget.active = self.isActive),
  onUpdate: (self) => {
    filmTarget.p = self.progress;
    filmFill.style.width = self.progress * 100 + "%";

    /* chapter = thirds of the pinned scroll */
    const ci = Math.min(2, Math.floor(self.progress * 3));
    if (ci !== filmState.ci) {
      filmState.ci = ci;
      filmState.frame = 0; /* jump-cut between films */
      filmState.dirty = true;
      filmIndex.textContent = String(ci + 1).padStart(2, "0");
      filmLabel.textContent = FILM.chapters[ci].label;
      chapterEls.forEach((el, i) => el.classList.toggle("is-active", i === ci));
    }
  },
});
/* initialize captions */
filmLabel.textContent = FILM.chapters[0].label;

function drawFilm() {
  const ch = FILM.chapters[filmState.ci];
  const w = filmCanvas.clientWidth, h = filmCanvas.clientHeight;
  if (!w || !h) return;
  fctx.clearRect(0, 0, w, h);

  const idx = Math.max(0, Math.min(ch.count - 1, Math.round(filmState.frame)));
  const img = FILM.frames[filmState.ci] && FILM.frames[filmState.ci][idx];
  if (!img || !img.complete || !img.naturalWidth) return;

  const iw = img.naturalWidth, ih = img.naturalHeight;
  const maxW = ch.vertical ? 0.52 * w : 0.94 * w;
  const maxH = 0.92 * h;
  const s = Math.min(maxW / iw, maxH / ih);
  const dw = iw * s, dh = ih * s;
  const dx = (w - dw) / 2, dy = (h - dh) / 2;
  const radius = 16;

  fctx.save();
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";
  fctx.shadowColor = "rgba(0,0,0,0.5)";
  fctx.shadowBlur = 50;
  fctx.shadowOffsetY = 20;
  fctx.fillStyle = "#0F1210";
  if (fctx.roundRect) { fctx.beginPath(); fctx.roundRect(dx, dy, dw, dh, radius); fctx.fill(); }
  fctx.restore();

  fctx.save();
  if (fctx.roundRect) { fctx.beginPath(); fctx.roundRect(dx, dy, dw, dh, radius); fctx.clip(); }
  fctx.drawImage(img, dx, dy, dw, dh);
  fctx.restore();

  fctx.save();
  fctx.strokeStyle = "rgba(242,238,228,0.18)";
  fctx.lineWidth = 1;
  if (fctx.roundRect) { fctx.beginPath(); fctx.roundRect(dx + .5, dy + .5, dw - 1, dh - 1, radius); fctx.stroke(); }
  fctx.font = "600 10px 'IBM Plex Mono', monospace";
  fctx.fillStyle = "rgba(242,238,228,0.5)";
  fctx.fillText(`FRAME ${String(idx + 1).padStart(3, "0")} / ${String(ch.count).padStart(3, "0")}`, dx, dy - 10);
  fctx.fillStyle = "rgba(255,76,31,0.95)";
  fctx.beginPath(); fctx.arc(dx + dw - 8, dy - 13, 3.5, 0, Math.PI * 2); fctx.fill();
  fctx.restore();
}

function filmLoop() {
  requestAnimationFrame(filmLoop);
  if (!filmTarget.active && !filmState.dirty) return;
  const ch = FILM.chapters[filmState.ci];
  const local = Math.max(0, Math.min(1, filmTarget.p * 3 - filmState.ci));
  const targetFrame = local * (ch.count - 1);
  const prev = filmState.frame;
  filmState.frame = lerp(filmState.frame, targetFrame, 0.14);
  if (Math.abs(filmState.frame - prev) > 0.01 || filmState.dirty) {
    filmState.dirty = false;
    drawFilm();
  }
}
resizeFilmCanvas();
filmLoop();

/* ============ CUSTOM CURSOR ============ */
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
if (window.matchMedia("(pointer:fine)").matches) {
  const pos = { x: -100, y: -100 }, ringPos = { x: -100, y: -100 };
  window.addEventListener("mousemove", (e) => { pos.x = e.clientX; pos.y = e.clientY; });
  gsap.ticker.add(() => {
    ringPos.x = lerp(ringPos.x, pos.x, 0.18);
    ringPos.y = lerp(ringPos.y, pos.y, 0.18);
    dot.style.transform = `translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${ringPos.x}px,${ringPos.y}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-" + el.dataset.cursor));
    el.addEventListener("mouseleave", () => (ring.className = "cursor-ring"));
  });
}

/* ============ ANCHOR SCROLL VIA LENIS ============ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  });
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
});
