gsap.registerPlugin(ScrollTrigger);

/* ============ FORCE FRESH START ON EVERY LOAD/REFRESH ============ */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

/* ============ LENIS SMOOTH SCROLL ============ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ============ LOADER ============ */
const loader = document.getElementById("loader");
const loaderBarFill = document.getElementById("loader-bar-fill");
const loaderPercent = document.getElementById("loader-percent");
let pct = 0;
const loaderTimer = setInterval(() => {
  pct += Math.random() * 18 + 8;
  if (pct >= 100) {
    pct = 100;
    clearInterval(loaderTimer);
    setTimeout(() => {
      loader.classList.add("hidden");
      playHeroIntro();
    }, 250);
  }
  loaderBarFill.style.width = pct + "%";
  loaderPercent.textContent = Math.floor(pct) + "%";
}, 110);

/* ============ HERO INTRO ============ */
function playHeroIntro() {
  gsap.set(".hero-heading .word", { clipPath: "inset(0 0 100% 0)", y: 24 });
  gsap.to(".hero-heading .word", {
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    duration: 1.1,
    stagger: 0.1,
    ease: "power4.out",
  });
  gsap.from([".hero-tagline", ".scroll-indicator", ".stamp-badge"], {
    opacity: 0,
    y: 18,
    duration: 0.9,
    delay: 0.5,
    stagger: 0.12,
    ease: "power3.out",
  });
  gsap.from(".site-header", { opacity: 0, y: -12, duration: 0.8, delay: 0.7 });
}

/* ============ HEADER SCROLL STATE ============ */
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});

/* ============ POSITION SECTIONS ALONG SCROLL CONTAINER ============ */
const sections = Array.from(document.querySelectorAll(".scroll-section"));
sections.forEach((sec) => {
  const enter = parseFloat(sec.dataset.enter);
  const leave = parseFloat(sec.dataset.leave);
  const mid = (enter + leave) / 2;
  sec.style.top = mid + "%";
  sec.style.transform = "translateY(-50%)";
  sec._played = false;
});

/* ============ CANVAS FLOW DIAGRAM ============ */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWrap = document.querySelector(".canvas-wrap");
const caption = document.querySelector(".canvas-caption");
const ccIndex = document.getElementById("cc-index");
const ccLabel = document.getElementById("cc-label");

const NODE_LABELS = [
  "INBOUND LEAD RECEIVED",
  "AI AGENT RESPONDS",
  "CRM SYNCED",
  "APPOINTMENT BOOKED",
];

let dpr = Math.min(window.devicePixelRatio || 1, 2);
function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getNodePositions() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mobile = w < 860;
  const y = h * 0.5;
  const margin = mobile ? w * 0.14 : w * 0.18;
  const usable = w - margin * 2;
  return NODE_LABELS.map((_, i) => ({
    x: margin + (usable * i) / (NODE_LABELS.length - 1),
    y,
  }));
}

function drawFrame(segProgress) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  // background
  ctx.fillStyle = "#0F1210";
  ctx.fillRect(0, 0, w, h);

  // faint grid
  ctx.strokeStyle = "rgba(242,238,226,0.045)";
  ctx.lineWidth = 1;
  const gap = 64;
  for (let x = 0; x < w; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const nodes = getNodePositions();
  const segment = Math.max(0, Math.min(segProgress, 1)) * (nodes.length - 1);
  const segIndex = Math.min(Math.floor(segment), nodes.length - 2);
  const segT = segment - segIndex;

  // lines
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    let t = 0;
    if (i < segIndex) t = 1;
    else if (i === segIndex) t = segT;
    ctx.strokeStyle = "rgba(242,238,226,0.14)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    if (t > 0) {
      const ex = a.x + (b.x - a.x) * t;
      const ey = a.y + (b.y - a.y) * t;
      ctx.strokeStyle = "#FF4C1F";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // nodes
  nodes.forEach((n, i) => {
    const reached = i <= segIndex;
    const arriving = i === segIndex + 1;
    let alpha = reached ? 1 : arriving ? 0.25 + 0.75 * segT : 0.22;
    const r = reached || arriving ? 9 : 6;

    ctx.beginPath();
    ctx.arc(n.x, n.y, r + 10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,76,31,${reached ? 0.14 : 0.0})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = reached ? "#FF4C1F" : `rgba(242,238,226,${alpha})`;
    ctx.fill();
    if (!reached) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(242,238,226,${Math.max(alpha, 0.3)})`;
      ctx.stroke();
    }

    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = reached ? "#F2EEE2" : "rgba(242,238,226,0.4)";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1).padStart(2, "0"), n.x, n.y - r - 18);
  });

  // pulse dot traveling current segment
  if (segIndex < nodes.length - 1) {
    const a = nodes[segIndex];
    const b = nodes[segIndex + 1];
    const px = a.x + (b.x - a.x) * segT;
    const py = a.y + (b.y - a.y) * segT;
    const pulse = 4 + Math.sin(Date.now() / 160) * 1.5;
    ctx.beginPath();
    ctx.arc(px, py, pulse + 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,76,31,0.25)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }

  // update caption
  const labelIdx = Math.min(
    Math.round(segIndex + segT),
    NODE_LABELS.length - 1
  );
  if (ccLabel.dataset.idx !== String(labelIdx)) {
    ccLabel.dataset.idx = String(labelIdx);
    ccIndex.textContent = String(labelIdx + 1).padStart(2, "0");
    ccLabel.textContent = NODE_LABELS[labelIdx];
  }
}
drawFrame(0);

function loopCanvas() {
  requestAnimationFrame(loopCanvas);
}
loopCanvas();

/* ============ ENTRANCE ANIMATIONS ============ */
function getChildren(section) {
  return section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, .section-list li, .process-list li, .section-price, .cta-heading, .cta-button, .stat"
  );
}

function playEntrance(section) {
  const type = section.dataset.animation;
  const children = getChildren(section);
  const base = { opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" };
  let fromVars;
  switch (type) {
    case "slide-left":
      fromVars = { ...base, x: -70 };
      break;
    case "slide-right":
      fromVars = { ...base, x: 70 };
      break;
    case "scale-up":
      fromVars = { ...base, scale: 0.86, duration: 1.0, ease: "power2.out" };
      break;
    case "rotate-in":
      fromVars = { ...base, y: 34, rotation: 2.5 };
      break;
    case "stagger-up":
      fromVars = { ...base, y: 54, stagger: 0.12 };
      break;
    case "clip-reveal":
      fromVars = {
        ...base,
        clipPath: "inset(100% 0 0 0)",
        duration: 1.1,
        ease: "power4.inOut",
        stagger: 0.14,
      };
      break;
    case "fade-up":
    default:
      fromVars = { ...base, y: 46 };
  }
  gsap.fromTo(children, fromVars, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    clipPath: "inset(0% 0 0 0)",
    duration: fromVars.duration,
    stagger: fromVars.stagger,
    ease: fromVars.ease,
  });
}

/* ============ COUNTERS ============ */
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseFloat(el.dataset.value);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  ScrollTrigger.create({
    trigger: el.closest(".scroll-section"),
    start: "top 85%",
    onEnter: () =>
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.8,
          ease: "power1.out",
          snap: { textContent: decimals === 0 ? 1 : 0.01 },
        }
      ),
    once: true,
  });
});

/* ============ MASTER SCROLL TIMELINE ============ */
const scrollContainer = document.getElementById("scroll-container");
const heroSection = document.querySelector(".hero-standalone");
const darkOverlay = document.getElementById("dark-overlay");
const marquees = document.querySelectorAll(".marquee-wrap");

function renderScene(self) {
    const p = self.progress; // 0..1 across whole scroll-container
    const p100 = p * 100;

    /* hero fade + circle wipe reveal */
    heroSection.style.opacity = Math.max(0, 1 - p100 * 8);
    heroSection.style.pointerEvents = p100 > 1 ? "none" : "auto";
    const wipe = Math.max(0, Math.min(1, (p100 - 0.5) / 5));
    canvasWrap.style.clipPath = `circle(${wipe * 78}% at 50% 50%)`;
    caption.classList.toggle("visible", p100 > 3);
    header.classList.toggle("on-dark", p100 > 1);

    /* canvas flow diagram: active across ~2% - 96% */
    const canvasP = Math.max(0, Math.min(1, (p100 - 2) / 94));
    drawFrame(canvasP);

    /* dark overlay strongest during stats section */
    const statOverlay = rangeOpacity(p100, 63, 77, 3, 0.0);
    darkOverlay.style.opacity = statOverlay * 0.0; // canvas bg already dark; keep overlay off, reserved for future use

    /* marquees: fade in/out + horizontal drift */
    marquees.forEach((m) => {
      const speed = parseFloat(m.dataset.scrollSpeed) || -20;
      const id = m.id;
      let range;
      if (id === "marquee-1") range = [9, 21];
      else range = [60, 78];
      const op = rangeOpacity(p100, range[0], range[1], 4, 0);
      m.style.opacity = op * 0.9;
      const text = m.querySelector(".marquee-text");
      const localT = Math.max(0, Math.min(1, (p100 - range[0]) / (range[1] - range[0])));
      text.style.transform = `translateX(${speed * localT}%)`;
    });

    /* section entrance/exit */
    sections.forEach((sec) => {
      const enter = parseFloat(sec.dataset.enter);
      const leave = parseFloat(sec.dataset.leave);
      const persist = sec.dataset.persist === "true";
      const fade = 2.5;
      let opacity;
      if (p100 < enter - fade) opacity = 0;
      else if (p100 < enter) opacity = (p100 - (enter - fade)) / fade;
      else if (p100 <= leave) opacity = 1;
      else if (persist) opacity = 1;
      else if (p100 <= leave + fade) opacity = 1 - (p100 - leave) / fade;
      else opacity = 0;

      sec.style.opacity = opacity;
      const active = opacity > 0.05;
      sec.classList.toggle("is-active", active);

      if (active && !sec._played) {
        sec._played = true;
        playEntrance(sec);
      }
      if (!active && sec._played && !persist) {
        sec._played = false;
      }
    });
}

function rangeOpacity(p100, enter, leave, fade, floor) {
  if (p100 < enter - fade) return floor;
  if (p100 < enter) return (p100 - (enter - fade)) / fade;
  if (p100 <= leave) return 1;
  if (p100 <= leave + fade) return 1 - (p100 - leave) / fade;
  return floor;
}

const masterST = ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: renderScene,
});

/* Force an immediate render on every load/refresh so the scene is never
   stuck in its default hidden CSS state waiting for a scroll event that
   may never come (e.g. if the browser restores scroll position silently,
   or the user never nudges the wheel before checking the page). */
renderScene(masterST);
ScrollTrigger.refresh();
renderScene(masterST);

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
  renderScene(masterST);
});
