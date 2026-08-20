// ===== SCIA — interactions premium =====

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Préloader ----------
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloaderBar");
const preloaderStatus = document.getElementById("preloaderStatus");
const statuses = [
  "initialisation des agents…",
  "chargement des modèles IA…",
  "connexion au standardiste…",
  "systèmes opérationnels ✓",
];
let plProgress = 0;
let plStep = 0;
const plTimer = setInterval(() => {
  plProgress = Math.min(plProgress + 12 + Math.random() * 18, 100);
  preloaderBar.style.width = plProgress + "%";
  const idx = Math.min(Math.floor(plProgress / 28), statuses.length - 1);
  if (idx !== plStep) {
    plStep = idx;
    preloaderStatus.textContent = statuses[idx];
  }
  if (plProgress >= 100) clearInterval(plTimer);
}, 160);

function hidePreloader() {
  preloaderBar.style.width = "100%";
  preloaderStatus.textContent = statuses[statuses.length - 1];
  setTimeout(() => preloader.classList.add("done"), 350);
}
if (reducedMotion) {
  preloader.classList.add("done");
} else {
  window.addEventListener("load", () => setTimeout(hidePreloader, 500));
  setTimeout(hidePreloader, 3200); // filet de sécurité
}

// ---------- Année du footer ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Navigation : fond au scroll + barre de progression ----------
const nav = document.getElementById("nav");
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
}, { passive: true });

// ---------- Scrollspy (lien actif) ----------
const sections = [...document.querySelectorAll("section[id]")];
const navAnchors = [...document.querySelectorAll(".nav-links a")];
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
        );
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => spy.observe(s));

// ---------- Menu mobile ----------
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

// ---------- Curseur personnalisé ----------
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
let mouseX = -100, mouseY = -100;
let ringX = -100, ringY = -100;

if (finePointer && !reducedMotion) {
  document.documentElement.classList.add("has-cursor");
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX - 3.5}px, ${mouseY - 3.5}px)`;
  }, { passive: true });
  (function ringLoop() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    const half = cursorRing.offsetWidth / 2;
    cursorRing.style.transform = `translate(${ringX - half}px, ${ringY - half}px)`;
    requestAnimationFrame(ringLoop);
  })();
  document.querySelectorAll("a, button, .card, .contact-terminal").forEach((el) => {
    el.addEventListener("pointerenter", () => cursorRing.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => cursorRing.classList.remove("is-hover"));
  });
  window.addEventListener("pointerdown", () => cursorRing.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursorRing.classList.remove("is-down"));
}

// ---------- Boutons magnétiques ----------
if (finePointer && !reducedMotion) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.28;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "translate(0, 0)";
      setTimeout(() => (el.style.transition = ""), 400);
    });
  });
}

// ---------- Inclinaison 3D (tilt) ----------
if (finePointer && !reducedMotion) {
  document.querySelectorAll(".tilt").forEach((el) => {
    const maxTilt = 7;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * maxTilt;
      const ry = (px - 0.5) * maxTilt;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
      setTimeout(() => (el.style.transition = ""), 500);
    });
  });
}

// ---------- Orbe : parallaxe à la souris ----------
const orbScene = document.getElementById("orbScene");
if (orbScene && finePointer && !reducedMotion) {
  window.addEventListener("pointermove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * -6;
    const ry = ((e.clientX - cx) / cx) * 8;
    orbScene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, { passive: true });
}

// ---------- Halos : parallaxe douce ----------
const glow1 = document.getElementById("glow1");
const glow2 = document.getElementById("glow2");
if (finePointer && !reducedMotion) {
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    glow1.style.transform = `translate(${nx * 60}px, ${ny * 40}px)`;
    glow2.style.transform = `translate(${nx * -50}px, ${ny * -34}px)`;
  }, { passive: true });
}

// ---------- Apparition au scroll ----------
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

// ---------- Compteurs animés ----------
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

// ---------- Machine à écrire ----------
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
if (!reducedMotion) setTimeout(typeLoop, 2600);

// ---------- Bandeau défilant : boucle sans couture ----------
const marqueeTrack = document.getElementById("marqueeTrack");
if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

// ---------- Terminal : lignes tapées en direct ----------
const terminalBody = document.getElementById("terminalBody");
if (terminalBody && !reducedMotion) {
  terminalBody.classList.add("typing");
  const termObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        termObserver.unobserve(entry.target);
        const lines = [...terminalBody.querySelectorAll("p")];
        lines.forEach((line, i) => {
          setTimeout(() => line.classList.add("shown"), 400 + i * 620);
        });
      });
    },
    { threshold: 0.4 }
  );
  termObserver.observe(terminalBody);
}

// ---------- Particules interactives (réseau neuronal) ----------
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
let W, H;
const pointer = { x: -9999, y: -9999 };

window.addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
}, { passive: true });
window.addEventListener("pointerleave", () => {
  pointer.x = -9999;
  pointer.y = -9999;
});

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
const MOUSE_DIST = 170;
const REPULSE_DIST = 90;

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    // répulsion douce autour du curseur
    const mdx = p.x - pointer.x;
    const mdy = p.y - pointer.y;
    const mdist = Math.hypot(mdx, mdy);
    if (mdist < REPULSE_DIST && mdist > 0.01) {
      const force = ((REPULSE_DIST - mdist) / REPULSE_DIST) * 0.6;
      p.x += (mdx / mdist) * force;
      p.y += (mdy / mdist) * force;
    }
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(94, 234, 212, 0.45)";
    ctx.fill();
  }
  // liaisons entre particules
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
    // liaisons vers le curseur
    const dxm = particles[i].x - pointer.x;
    const dym = particles[i].y - pointer.y;
    const dm = Math.hypot(dxm, dym);
    if (dm < MOUSE_DIST) {
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.strokeStyle = `rgba(94, 234, 212, ${0.22 * (1 - dm / MOUSE_DIST)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  requestAnimationFrame(drawParticles);
}
if (!reducedMotion) drawParticles();
