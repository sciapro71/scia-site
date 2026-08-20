// ===== SCIA — interactions =====

// Année du footer
document.getElementById("year").textContent = new Date().getFullYear();

// Navigation : fond au scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

// Menu mobile
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

// Apparition au scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Compteurs animés
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat-value").forEach((el) => statObserver.observe(el));

// Effet machine à écrire
const phrases = [
  "votre entreprise",
  "vos appels",
  "votre WhatsApp",
  "vos e-mails",
  "votre qualité",
];
const tw = document.getElementById("typewriter");
let phraseIdx = 0;
let charIdx = phrases[0].length;
let deleting = true;
let twStarted = false;

function typeLoop() {
  const current = phrases[phraseIdx];
  if (deleting) {
    charIdx--;
    if (charIdx <= 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      charIdx = 0;
    }
  } else {
    charIdx++;
    if (charIdx >= phrases[phraseIdx].length) {
      deleting = true;
      tw.textContent = phrases[phraseIdx];
      setTimeout(typeLoop, 2200);
      return;
    }
  }
  tw.textContent = (deleting ? current : phrases[phraseIdx]).slice(0, charIdx);
  setTimeout(typeLoop, deleting ? 45 : 85);
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setTimeout(() => { if (!twStarted) { twStarted = true; typeLoop(); } }, 2600);
}

// Effet lumière qui suit la souris sur les cartes
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});

// Particules connectées (réseau neuronal)
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const count = Math.min(90, Math.floor((W * H) / 22000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
  }));
}
window.addEventListener("resize", resize);
resize();

const LINK_DIST = 130;
function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(94, 234, 212, 0.45)";
    ctx.fill();
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < LINK_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.14 * (1 - dist / LINK_DIST)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  drawParticles();
}
