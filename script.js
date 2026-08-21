/* ============================================================
   SCIA — moteur du site. Aucune dépendance externe.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Configuration (coordonnées & envoi du formulaire) ----------
     formEndpoint : laissez vide pour le mode e-mail (mailto pré-rempli,
     aucun faux envoi). Pour un envoi serveur réel, renseignez l'URL d'un
     endpoint acceptant un POST (Formspree, webhook Make…) — voir README. */
  const CONFIG = {
    email: "sc.iapro71@gmail.com",
    instagram: "https://instagram.com/scia.pro",
    formEndpoint: "",
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const narrowQuery = window.matchMedia("(max-width: 820px)");

  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ========================================================
     PRÉLOADER (court)
     ======================================================== */
  const preloader = $("#preloader");
  const preloaderBar = $("#preloaderBar");
  if (new URLSearchParams(location.search).has("vt")) {
    preloader.style.display = "none"; // mode capture/vérification
  } else if (reducedMotion) {
    preloader.classList.add("done");
  } else {
    let p = 0;
    const pt = setInterval(() => {
      p = Math.min(p + 18 + Math.random() * 20, 100);
      preloaderBar.style.width = p + "%";
      if (p >= 100) clearInterval(pt);
    }, 110);
    const hide = () => {
      preloaderBar.style.width = "100%";
      setTimeout(() => preloader.classList.add("done"), 240);
    };
    window.addEventListener("load", () => setTimeout(hide, 250));
    setTimeout(hide, 2200); // filet de sécurité
  }

  /* ========================================================
     HEADER
     ======================================================== */
  const nav = $("#nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });

  const burger = $("#burger");
  const navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ========================================================
     CURSEUR (desktop) + BOUTONS MAGNÉTIQUES
     ======================================================== */
  const cursorDot = $("#cursorDot");
  const cursorRing = $("#cursorRing");
  let mx = 0, my = 0;
  if (finePointer && !reducedMotion) {
    document.documentElement.classList.add("has-cursor");
    let rx = -100, ry = -100;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = "translate(" + (mx - 3) + "px, " + (my - 3) + "px)";
    }, { passive: true });
    (function ringLoop() {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      const half = cursorRing.offsetWidth / 2;
      cursorRing.style.transform = "translate(" + (rx - half) + "px, " + (ry - half) + "px)";
      requestAnimationFrame(ringLoop);
    })();
    document.querySelectorAll("a, button, summary, .friction").forEach((el) => {
      el.addEventListener("pointerenter", () => cursorRing.classList.add("survol"));
      el.addEventListener("pointerleave", () => cursorRing.classList.remove("survol"));
    });

    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + dx * 0.18 + "px, " + dy * 0.18 + "px)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 0.4s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => (el.style.transition = ""), 400);
      });
    });

    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform =
          "perspective(900px) rotateX(" + ((0.5 - py) * 3.4).toFixed(2) + "deg) rotateY(" +
          ((px - 0.5) * 3.4).toFixed(2) + "deg)";
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* ========================================================
     APPARITIONS
     ======================================================== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ========================================================
     BANDEAU (boucle sans couture, doublon masqué aux lecteurs d'écran)
     ======================================================== */
  const bandeauTrack = $("#bandeauTrack");
  bandeauTrack.innerHTML +=
    '<span class="bandeau-dup" aria-hidden="true">' + bandeauTrack.innerHTML + "</span>";

  /* ========================================================
     FRICTIONS — bascule tactile
     ======================================================== */
  document.querySelectorAll(".friction").forEach((f) => {
    f.addEventListener("click", () => {
      document.querySelectorAll(".friction.actif").forEach((o) => { if (o !== f) o.classList.remove("actif"); });
      f.classList.toggle("actif");
    });
  });

  /* ========================================================
     MÉTHODE — rail lié au scroll
     ======================================================== */
  const methodeWrap = $("#methodeWrap");
  const methodeFill = $("#methodeFill");
  const msteps = Array.from(document.querySelectorAll(".mstep"));
  function majMethode() {
    const r = methodeWrap.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.62 - r.top) / r.height, 0, 1);
    methodeFill.style.height = (progress * 100).toFixed(1) + "%";
    const rempli = progress * r.height;
    msteps.forEach((s) => s.classList.toggle("actif", s.offsetTop + 34 <= rempli));
  }
  if (reducedMotion) {
    methodeFill.style.height = "100%";
    msteps.forEach((s) => s.classList.add("actif"));
  } else {
    let tick = false;
    window.addEventListener("scroll", () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => { majMethode(); tick = false; });
    }, { passive: true });
    majMethode();
  }

  /* ========================================================
     CAS D'USAGE — onglets + diagramme de flux
     ======================================================== */
  const CAS = {
    "Administratif": {
      entrees: ["E-mails reçus", "Formulaires", "Pièces jointes"],
      sorties: ["Dossiers relancés", "Documents générés", "Archivage classé"],
      scenarios: [
        "Relancer les dossiers incomplets.",
        "Générer automatiquement des documents à partir d'un formulaire.",
        "Archiver les documents et leurs pièces justificatives.",
      ],
    },
    "Commercial": {
      entrees: ["Demandes entrantes", "E-mails prospects", "Site web"],
      sorties: ["E-mails triés", "Demandes qualifiées", "Équipe alertée"],
      scenarios: [
        "Trier et distribuer automatiquement les e-mails entrants.",
        "Qualifier une demande client avant intervention humaine.",
        "Identifier les urgences et déclencher une alerte.",
      ],
    },
    "Relation client": {
      entrees: ["Appels", "Messages", "Questions fréquentes"],
      sorties: ["Demandes transmises", "Réponses apportées", "Urgences signalées"],
      scenarios: [
        "Répondre aux appels et transmettre les demandes qualifiées.",
        "Identifier les urgences et déclencher une alerte.",
      ],
    },
    "Documents": {
      entrees: ["Formulaires", "Modèles", "Données métier"],
      sorties: ["Documents générés", "Synthèses prêtes", "Classement à jour"],
      scenarios: [
        "Générer automatiquement des documents à partir d'un formulaire.",
        "Préparer des comptes rendus ou synthèses.",
        "Archiver les documents et leurs pièces justificatives.",
      ],
    },
    "Suivi opérationnel": {
      entrees: ["Outils métier", "Tableurs", "E-mails"],
      sorties: ["Registre centralisé", "Avancement à jour", "Relances planifiées"],
      scenarios: [
        "Centraliser les informations dans un registre ou tableau de bord.",
        "Suivre l'avancement d'un dossier sans ressaisie manuelle.",
        "Relancer les dossiers incomplets.",
      ],
    },
  };

  const casTabs = $("#casTabs");
  const casListe = $("#casListe");
  const casFlux = $("#casFlux");
  const cats = Object.keys(CAS);

  function noeud(x, y, label, sortie) {
    const w = 150, h = 34;
    return (
      '<rect class="flux-node" x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="4"/>' +
      '<text class="' + (sortie ? "flux-out-txt" : "flux-node-txt") + '" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + label + "</text>"
    );
  }
  function lien(x1, y1, x2, y2, or) {
    const mx1 = (x1 + x2) / 2;
    return '<path class="' + (or ? "flux-lien-or" : "flux-lien") + '" d="M' + x1 + " " + y1 + " C" + mx1 + " " + y1 + " " + mx1 + " " + y2 + " " + x2 + " " + y2 + '"/>';
  }
  function renderFlux(cat) {
    const d = CAS[cat];
    const ys = [60, 150, 240];
    let svg = "";
    d.entrees.forEach((e, i) => { svg += lien(160, ys[i], 236, 150, false); });
    d.sorties.forEach((s, i) => { svg += lien(324, 150, 400, ys[i], true); });
    d.entrees.forEach((e, i) => { svg += noeud(85, ys[i], e, false); });
    d.sorties.forEach((s, i) => { svg += noeud(475, ys[i], s, true); });
    svg +=
      '<circle class="flux-core" cx="280" cy="150" r="44" stroke-width="1.5"/>' +
      '<circle cx="280" cy="150" r="52" fill="none" stroke="rgba(226,177,38,0.25)" stroke-width="1" stroke-dasharray="3 7"/>' +
      '<text class="flux-core-txt" x="280" y="156" text-anchor="middle">SCIA</text>';
    casFlux.innerHTML = svg;
    casListe.innerHTML = d.scenarios.map((s) => "<li>" + s + "</li>").join("");
  }
  casTabs.innerHTML = cats
    .map((c, i) =>
      '<button type="button" class="cas-tab" role="tab" id="tab-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + c + "</button>"
    )
    .join("");
  const tabEls = Array.from(casTabs.querySelectorAll(".cas-tab"));
  function activerTab(i) {
    tabEls.forEach((t, j) => {
      t.setAttribute("aria-selected", String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    renderFlux(cats[i]);
  }
  tabEls.forEach((t, i) => {
    t.addEventListener("click", () => activerTab(i));
    t.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = (i + 1) % cats.length;
      if (e.key === "ArrowLeft") n = (i - 1 + cats.length) % cats.length;
      if (n !== null) { e.preventDefault(); activerTab(n); tabEls[n].focus(); }
    });
  });
  renderFlux(cats[0]);

  /* ========================================================
     DIALOGS LÉGAUX
     ======================================================== */
  const openDlg = (d) => (d.showModal ? d.showModal() : d.setAttribute("open", ""));
  const closeDlg = (d) => (d.close ? d.close() : d.removeAttribute("open"));
  $("#openMentions").addEventListener("click", () => openDlg($("#dlgMentions")));
  $("#openPrivacy").addEventListener("click", () => openDlg($("#dlgPrivacy")));
  document.querySelectorAll(".close-dialog").forEach((b) =>
    b.addEventListener("click", () => closeDlg(document.getElementById(b.dataset.close)))
  );

  /* ========================================================
     FORMULAIRE — validation + envoi honnête
     ======================================================== */
  const form = $("#auditForm");
  const formStatus = $("#formStatus");
  const formNote = $("#formNote");
  formNote.textContent = CONFIG.formEndpoint
    ? "Vos informations sont utilisées uniquement pour préparer votre audit."
    : "L'envoi ouvre votre messagerie avec la demande pré-remplie, adressée à " + CONFIG.email + ".";

  function setStatus(kind, msg) {
    formStatus.className = "form-status show " + kind;
    formStatus.textContent = msg;
  }
  function valider() {
    let premier = null;
    const marque = (input, mauvais) => {
      const champ = input.closest(".champ");
      champ.classList.toggle("invalide", mauvais);
      if (mauvais && !premier) premier = input;
    };
    const nom = $("#fNom"), ent = $("#fEntreprise"), email = $("#fEmail"),
      secteur = $("#fSecteur"), processus = $("#fProcessus");
    marque(nom, nom.value.trim().length < 2);
    marque(ent, ent.value.trim().length < 2);
    marque(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    marque(secteur, !secteur.value);
    marque(processus, processus.value.trim().length < 10);
    if (premier) { premier.focus(); return false; }
    return true;
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!valider()) {
      setStatus("erreur", "Merci de compléter les champs signalés ci-dessus.");
      return;
    }
    const data = new FormData(form);
    if (CONFIG.formEndpoint) {
      const btn = $("#submitBtn");
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";
      try {
        const res = await fetch(CONFIG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus("ok", "Demande envoyée — nous revenons vers vous rapidement. Merci !");
        form.reset();
      } catch (err) {
        setStatus("erreur", "L'envoi a échoué (" + err.message + "). Écrivez-nous directement : " + CONFIG.email);
      } finally {
        btn.disabled = false;
        btn.textContent = "Demander un audit";
      }
    } else {
      const lignes = [
        "Demande d'audit — SCIA",
        "",
        "Nom : " + data.get("nom"),
        "Entreprise : " + data.get("entreprise"),
        "E-mail : " + data.get("email"),
        "Téléphone : " + (data.get("telephone") || "—"),
        "Secteur : " + data.get("secteur"),
        "",
        "Processus à améliorer :",
        data.get("processus"),
      ];
      setStatus("ok", "Votre messagerie va s'ouvrir avec la demande pré-remplie — il ne reste qu'à l'envoyer.");
      window.location.href =
        "mailto:" + CONFIG.email +
        "?subject=" + encodeURIComponent("Demande d'audit — " + data.get("entreprise")) +
        "&body=" + encodeURIComponent(lignes.join("\n"));
    }
  });

  /* ========================================================
     MOTEUR OPÉRATIONNEL SCIA — scène 3D signature
     Chaos (bleu froid) → capture par les nœuds-outils →
     traversée du noyau (or) → trajectoire ascendante (croissance).
     ======================================================== */
  const canvas = $("#engineCanvas");
  const hero = $(".hero");
  const ctx = canvas.getContext && canvas.getContext("2d");

  if (ctx) {
    const mobile = narrowQuery.matches;
    const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    const T_OFFSET = parseFloat(new URLSearchParams(location.search).get("vt")) || 0;

    /* ----- géométrie ----- */
    const CYCLE = 9000;
    const N_FLUX = mobile ? 70 : 150;
    const N_CORE = mobile ? 150 : 260;

    // noyau : sphère de Fibonacci
    const corePts = [];
    for (let i = 0; i < N_CORE; i++) {
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / N_CORE);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      corePts.push({
        x: 15 * Math.cos(theta) * Math.sin(phi),
        y: 15 * Math.cos(phi),
        z: 15 * Math.sin(theta) * Math.sin(phi),
      });
    }
    // anneaux
    function ring(r, n, tiltX, tiltZ) {
      const pts = [];
      const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
      const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        let x = r * Math.cos(a), y = 0, z = r * Math.sin(a);
        let y1 = y * cx - z * sx, z1 = y * sx + z * cx;
        let x2 = x * cz - y1 * sz, y2 = x * sz + y1 * cz;
        pts.push({ x: x2, y: y2, z: z1, a });
      }
      return pts;
    }
    const ring1 = ring(33, 80, 1.15, 0.1);
    const ring2 = ring(46, 100, 1.35, -0.16);
    const ring3 = ring(24, 60, 0.6, 0.5);

    // nœuds-outils sur la ceinture externe
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.35;
      nodes.push({
        x: 54 * Math.cos(a),
        y: (i % 2 === 0 ? 9 : -8) + Math.sin(a * 2) * 3,
        z: 54 * Math.sin(a),
      });
    }

    // trajectoire de sortie ascendante (référence à la flèche du logo)
    function sortiePos(u) {
      return {
        x: 10 + u * 58,
        y: 4 + u * 52 + Math.sin(u * Math.PI) * 6,
        z: 2 - u * 6,
      };
    }

    // particules de données : cycle déterministe
    const flux = [];
    for (let i = 0; i < N_FLUX; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      const r = 62 + Math.random() * 34;
      flux.push({
        cx: r * Math.cos(a) * Math.sin(b),
        cy: r * Math.cos(b) * 0.7,
        cz: r * Math.sin(a) * Math.sin(b),
        node: i % nodes.length,
        phase: Math.random(),
        seed: Math.random() * 10,
        rang: i / N_FLUX,
      });
    }

    const easeInOut = (t) => t * t * (3 - 2 * t);

    /* ----- rendu ----- */
    let W, H, cx0, cy0, scale;
    function resize() {
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (narrowQuery.matches) {
        cx0 = W * 0.5; cy0 = H * 0.84;
        scale = (W * 0.8) / 130;
      } else {
        cx0 = W * 0.72; cy0 = H * 0.46;
        scale = Math.min(W * 0.4, H * 0.74) / 128;
      }
    }
    window.addEventListener("resize", resize);
    resize();

    let pmx = 0, pmy = 0, smx = 0, smy = 0;
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        pmx = (e.clientX / window.innerWidth) * 2 - 1;
        pmy = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    } else {
      window.addEventListener("touchmove", (e) => {
        if (!e.touches[0]) return;
        pmx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pmy = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }

    let scrollP = 0;
    window.addEventListener("scroll", () => {
      scrollP = clamp(window.scrollY / (H * 0.9), 0, 1);
    }, { passive: true });

    const F = 300;
    let running = true;
    const heroObs = new IntersectionObserver((es) => {
      es.forEach((e) => { running = e.isIntersecting; });
    });
    heroObs.observe(hero);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden && hero.getBoundingClientRect().bottom > 0;
    });

    const draws = [];
    let t0 = null;

    function projette(p, cyaw, syaw, cpit, spit) {
      const x1 = p.x * cyaw + p.z * syaw;
      const z1 = -p.x * syaw + p.z * cyaw;
      const y2 = p.y * cpit - z1 * spit;
      const z2 = p.y * spit + z1 * cpit;
      const persp = F / (F + z2);
      return { sx: cx0 + x1 * scale * persp, sy: cy0 - y2 * scale * persp, z: z2, persp };
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!running && !reducedMotion) return;
      if (t0 === null) t0 = now;
      const t = now - t0 + T_OFFSET;

      smx = lerp(smx, pmx, 0.045);
      smy = lerp(smy, pmy, 0.045);
      const yaw = t * 0.00016 + smx * 0.3;
      const pitch = -0.34 + smy * 0.12;
      const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      const cpit = Math.cos(pitch), spit = Math.sin(pitch);
      // repère fixe pour la trajectoire de croissance : toujours vers le haut-droit
      const yawF = -0.15 + smx * 0.08;
      const cyawF = Math.cos(yawF), syawF = Math.sin(yawF);

      // part de flux "organisés" : augmente avec le scroll
      const ordre = clamp(0.45 + scrollP * 0.55 + Math.min(t / 14000, 0.15), 0, 0.97);
      const alphaG = 1 - scrollP * 0.35;

      draws.length = 0;

      // noyau (rotation propre lente)
      const rot = t * 0.00028;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      for (const p of corePts) {
        const px = p.x * cr + p.z * sr;
        const pz = -p.x * sr + p.z * cr;
        const pr = projette({ x: px, y: p.y, z: pz }, cyaw, syaw, cpit, spit);
        // éclairage : haut-droit doré, bas-gauche graphite
        const l = clamp(0.35 + (px / 30) * 0.35 + (p.y / 30) * 0.45, 0.12, 1);
        draws.push({
          z: pr.z, x: pr.sx, y: pr.sy,
          s: 2.3 * scale * 0.16 * pr.persp + 0.8,
          r: 26 + 150 * l * 0.9, g: 26 + 122 * l * 0.82, b: 28 + 60 * l * 0.6,
          a: 0.9 * alphaG,
        });
      }
      // anneaux métalliques
      const wob = t * 0.00035;
      for (const [pts, sp, lum] of [[ring1, 1, 0.5], [ring2, -0.6, 0.34], [ring3, 1.6, 0.85]]) {
        const c2 = Math.cos(wob * sp), s2 = Math.sin(wob * sp);
        for (const p of pts) {
          const px = p.x * c2 + p.z * s2;
          const pz = -p.x * s2 + p.z * c2;
          const pr = projette({ x: px, y: p.y, z: pz }, cyaw, syaw, cpit, spit);
          const or = lum > 0.7;
          draws.push({
            z: pr.z, x: pr.sx, y: pr.sy,
            s: (or ? 1.15 : 1.35) * pr.persp,
            r: or ? 226 : 122, g: or ? 177 : 126, b: or ? 38 : 134,
            a: (or ? 0.55 : 0.4) * alphaG,
          });
        }
      }
      // nœuds-outils + liaisons vers le noyau
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (const n of nodes) {
        const pr = projette(n, cyaw, syaw, cpit, spit);
        const pc = projette({ x: n.x * 0.28, y: n.y * 0.28, z: n.z * 0.28 }, cyaw, syaw, cpit, spit);
        ctx.strokeStyle = "rgba(167, 171, 178, " + (0.14 * alphaG).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(pr.sx, pr.sy);
        ctx.lineTo(pc.sx, pc.sy);
        ctx.stroke();
        draws.push({
          z: pr.z, x: pr.sx, y: pr.sy,
          s: 3.4 * pr.persp, carre: true,
          r: 200, g: 203, b: 210, a: 0.85 * alphaG,
        });
      }
      // trajectoire ascendante + pointe de flèche
      const ta = 0.25 + ordre * 0.55;
      ctx.strokeStyle = "rgba(226, 177, 38, " + (0.3 * ta * alphaG).toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let u = 0; u <= 1.001; u += 0.1) {
        const pr = projette(sortiePos(u), cyawF, syawF, cpit, spit);
        if (u === 0) ctx.moveTo(pr.sx, pr.sy);
        else ctx.lineTo(pr.sx, pr.sy);
      }
      ctx.stroke();
      const tip = projette(sortiePos(1), cyawF, syawF, cpit, spit);
      const avant = projette(sortiePos(0.9), cyawF, syawF, cpit, spit);
      const ang = Math.atan2(tip.sy - avant.sy, tip.sx - avant.sx);
      ctx.strokeStyle = "rgba(226, 177, 38, " + (0.7 * ta * alphaG).toFixed(3) + ")";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tip.sx, tip.sy);
      ctx.lineTo(tip.sx - 12 * Math.cos(ang - 0.45), tip.sy - 12 * Math.sin(ang - 0.45));
      ctx.moveTo(tip.sx, tip.sy);
      ctx.lineTo(tip.sx - 12 * Math.cos(ang + 0.45), tip.sy - 12 * Math.sin(ang + 0.45));
      ctx.stroke();

      // particules de données
      for (const p of flux) {
        const organise = p.rang < ordre;
        let pos, col, al, taille = 1.6;
        if (!organise) {
          // chaos : dérive douce, teinte bleu froid
          const w1 = t * 0.0004 + p.seed;
          pos = {
            x: p.cx + Math.sin(w1) * 7,
            y: p.cy + Math.cos(w1 * 0.8) * 7,
            z: p.cz + Math.sin(w1 * 0.6) * 7,
          };
          col = [127, 180, 217];
          al = 0.34;
        } else {
          const u = ((t / CYCLE) + p.phase) % 1;
          const n = nodes[p.node];
          if (u < 0.34) {
            // approche du nœud
            const k = easeInOut(u / 0.34);
            pos = { x: lerp(p.cx, n.x, k), y: lerp(p.cy, n.y, k), z: lerp(p.cz, n.z, k) };
            col = [lerp(127, 226, k), lerp(180, 190, k), lerp(217, 120, k)];
            al = 0.4 + k * 0.25;
          } else if (u < 0.62) {
            // nœud → noyau
            const k = easeInOut((u - 0.34) / 0.28);
            pos = { x: lerp(n.x, 0, k), y: lerp(n.y, 0, k), z: lerp(n.z, 0, k) };
            col = [226, lerp(190, 177, k), lerp(120, 38, k)];
            al = 0.7;
          } else {
            // sortie ascendante (repère fixe, comme la flèche)
            const k = easeInOut((u - 0.62) / 0.38);
            pos = sortiePos(k);
            col = [lerp(226, 242, k), lerp(177, 204, k), lerp(38, 85, k)];
            al = 0.85 * (1 - Math.pow(k, 3));
            taille = 1.9 - k * 0.7;
            const prS = projette(pos, cyawF, syawF, cpit, spit);
            draws.push({
              z: prS.z, x: prS.sx, y: prS.sy,
              s: taille * prS.persp * (scale * 0.055 + 0.9),
              r: col[0], g: col[1], b: col[2],
              a: al * alphaG,
            });
            continue;
          }
        }
        const pr = projette(pos, cyaw, syaw, cpit, spit);
        draws.push({
          z: pr.z, x: pr.sx, y: pr.sy,
          s: taille * pr.persp * (scale * 0.055 + 0.9),
          r: col[0], g: col[1], b: col[2],
          a: al * alphaG,
        });
      }

      // tri du peintre : lointain d'abord
      draws.sort((a, b) => b.z - a.z);
      for (const d of draws) {
        if (d.a <= 0.02) continue;
        ctx.globalAlpha = d.a;
        ctx.fillStyle = "rgb(" + (d.r | 0) + "," + (d.g | 0) + "," + (d.b | 0) + ")";
        if (d.carre) {
          ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
        } else {
          ctx.beginPath();
          ctx.arc(d.x, d.y, Math.max(d.s, 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    if (reducedMotion) {
      // rendu statique unique : système organisé, pas d'animation
      scrollP = 0.9;
      const once = () => {
        running = true;
        t0 = 0;
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = () => 0;
        frame(30000);
        window.requestAnimationFrame = raf;
      };
      once();
      window.addEventListener("resize", once);
    } else {
      requestAnimationFrame(frame);
    }
  }
})();
