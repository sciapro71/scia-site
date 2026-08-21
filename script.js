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
     MÉTHODE — pipeline lié au scroll
     (horizontal sur ordinateur, vertical sur mobile)
     ======================================================== */
  const pipeline = $("#pipeline");
  const pipeFill = $("#pipeFill");
  const psteps = Array.from(document.querySelectorAll(".pstep"));
  function majPipeline() {
    const r = pipeline.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.7 - r.top) / (r.height * 0.95), 0, 1);
    if (narrowQuery.matches) {
      pipeFill.style.width = "100%";
      pipeFill.style.height = (progress * 100).toFixed(1) + "%";
    } else {
      pipeFill.style.height = "100%";
      pipeFill.style.width = (progress * 100).toFixed(1) + "%";
    }
    psteps.forEach((s, i) => s.classList.toggle("actif", progress >= (i + 0.55) / psteps.length));
  }
  if (reducedMotion) {
    pipeFill.style.width = "100%";
    pipeFill.style.height = "100%";
    psteps.forEach((s) => s.classList.add("actif"));
  } else {
    let tick = false;
    window.addEventListener("scroll", () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => { majPipeline(); tick = false; });
    }, { passive: true });
    window.addEventListener("resize", majPipeline);
    majPipeline();
  }

  /* ========================================================
     COMPARATEUR AVANT / AVEC SCIA
     ======================================================== */
  const ba = $("#baCompare");
  if (ba) {
    let dragging = false;
    const setCut = (pct) => {
      pct = clamp(pct, 2, 98);
      ba.style.setProperty("--cut", pct + "%");
      ba.setAttribute("aria-valuenow", Math.round(pct));
    };
    const fromEvent = (e) => {
      const r = ba.getBoundingClientRect();
      setCut(((e.clientX - r.left) / r.width) * 100);
    };
    ba.addEventListener("pointerdown", (e) => { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", () => { dragging = false; });
    ba.addEventListener("pointercancel", () => { dragging = false; });
    ba.addEventListener("keydown", (e) => {
      const cur = parseFloat(ba.getAttribute("aria-valuenow"));
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setCut(cur - 5); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { setCut(cur + 5); e.preventDefault(); }
      if (e.key === "Home") { setCut(2); e.preventDefault(); }
      if (e.key === "End") { setCut(98); e.preventDefault(); }
    });
    if (!reducedMotion) {
      const baObs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          baObs.unobserve(en.target);
          let t = 0;
          const demo = setInterval(() => {
            t += 0.028;
            if (t >= Math.PI * 2 || dragging) { clearInterval(demo); return; }
            setCut(50 + Math.sin(t) * 26);
          }, 16);
        });
      }, { threshold: 0.5 });
      baObs.observe(ba);
    }
  }

  /* ========================================================
     MOTIF CIRCUIT SUR LES CARTES EXPERTISES
     ======================================================== */
  document.querySelectorAll(".xp").forEach((xp) => {
    const deco = document.createElement("span");
    deco.className = "xp-circuit";
    deco.setAttribute("aria-hidden", "true");
    deco.innerHTML =
      '<svg viewBox="0 0 90 60" fill="none" stroke="currentColor" stroke-width="1.6">' +
      '<path d="M88 30 h-24 v-16 h-20 M64 30 v14 h-18"/>' +
      '<circle cx="40" cy="14" r="3.2"/><circle cx="42" cy="44" r="3.2"/><circle cx="88" cy="30" r="2.2" fill="currentColor" stroke="none"/></svg>';
    xp.appendChild(deco);
  });

  /* ========================================================
     HALO DE L'EMBLÈME CTA
     ======================================================== */
  const embleme = $("#ctaEmbleme");
  if (embleme && finePointer && !reducedMotion) {
    window.addEventListener("pointermove", (e) => {
      const r = embleme.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const dx = clamp(e.clientX - (r.left + r.width / 2), -80, 80);
      const dy = clamp(e.clientY - (r.top + r.height / 2), -80, 80);
      embleme.style.setProperty("--hx", dx * 0.5 + "px");
      embleme.style.setProperty("--hy", dy * 0.5 + "px");
    }, { passive: true });
  }

  /* ========================================================
     PLAQUE 3D — inclinaison au curseur / au toucher
     ======================================================== */
  const plaque = $("#plaque3d");
  const heroEl = $(".hero");
  if (plaque && !reducedMotion) {
    let idleTimer = null;
    const incline = (nx, ny) => {
      plaque.classList.add("pilote");
      plaque.style.transform =
        "rotateX(" + (6 - ny * 7).toFixed(2) + "deg) rotateY(" + (-9 + nx * 11).toFixed(2) + "deg)";
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        plaque.classList.remove("pilote");
        plaque.style.transform = "";
      }, 2200);
    };
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        if (heroEl.getBoundingClientRect().bottom < 0) return;
        incline((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      }, { passive: true });
    } else {
      window.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        if (!t || heroEl.getBoundingClientRect().bottom < 0) return;
        incline((t.clientX / window.innerWidth) * 2 - 1, (t.clientY / window.innerHeight) * 2 - 1);
      }, { passive: true });
    }
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
     MOTEUR D'AUTOMATISATION SCIA — scène 3D signature
     La plaque-logo (DOM 3D) est le noyau. Deux canvas
     l'encadrent : les anneaux, nœuds et flux passent
     réellement DEVANT et DERRIÈRE l'emblème.
     Chaos (bleu froid) → connexion aux nœuds-outils →
     traversée de la plaque SCIA → trajectoire ascendante.
     ======================================================== */
  const canvasB = $("#engineCanvas");
  const canvasF = $("#engineCanvasFront");
  const plaqueZone = $("#plaqueZone");
  const hero = $(".hero");
  const ctxB = canvasB.getContext && canvasB.getContext("2d");
  const ctxF = canvasF.getContext && canvasF.getContext("2d");

  if (ctxB && ctxF) {
    const mobile = narrowQuery.matches;
    const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    const T_OFFSET = parseFloat(new URLSearchParams(location.search).get("vt")) || 0;
    const CYCLE = 9000;
    const N_FLUX = mobile ? 60 : 130;

    // anneaux mécaniques autour de la plaque
    function ring(r, n, tiltX, tiltZ) {
      const pts = [];
      const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
      const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = r * Math.cos(a), z = r * Math.sin(a);
        const y1 = -z * sx, z1 = z * cx;
        pts.push({ x: x * cz - y1 * sz, y: x * sz + y1 * cz, z: z1 });
      }
      return pts;
    }
    const ring1 = ring(82, 88, 1.18, 0.1);
    const ring2 = ring(102, 110, 1.4, -0.13);
    const ring3 = ring(64, 64, 0.55, 0.48);

    // nœuds-outils : désorganisés au départ, alignés au scroll
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      nodes.push({
        bx: 118 * Math.cos(a),
        by: (i % 2 === 0 ? 12 : -11) + Math.sin(a * 2) * 4,
        bz: 118 * Math.sin(a),
        dx: (Math.random() - 0.5) * 46,
        dy: (Math.random() - 0.5) * 34,
        dz: (Math.random() - 0.5) * 46,
      });
    }
    function nodePos(n, ordre) {
      const d = 1 - ordre;
      return { x: n.bx + n.dx * d, y: n.by + n.dy * d, z: n.bz + n.dz * d };
    }
    // point d'entrée sur la tranche de la plaque (vers le centre)
    function rimPos(n, ordre) {
      const p = nodePos(n, ordre);
      const l = Math.hypot(p.x, p.y, p.z) || 1;
      return { x: (p.x / l) * 62, y: (p.y / l) * 62 * 0.45, z: (p.z / l) * 62 };
    }
    function courbe(pA, pB, u) {
      // bézier quadratique bombée vers le haut
      const mx = (pA.x + pB.x) / 2, my = (pA.y + pB.y) / 2 + 20, mz = (pA.z + pB.z) / 2;
      const v = 1 - u;
      return {
        x: v * v * pA.x + 2 * v * u * mx + u * u * pB.x,
        y: v * v * pA.y + 2 * v * u * my + u * u * pB.y,
        z: v * v * pA.z + 2 * v * u * mz + u * u * pB.z,
      };
    }

    // trajectoire de croissance (prolonge la flèche du logo)
    const exitK = mobile ? 0.6 : 1;
    function sortiePos(u) {
      return {
        x: (30 + u * 62) * exitK,
        y: (10 + u * 74 + Math.sin(u * Math.PI) * 7) * exitK,
        z: 2 - u * 8,
      };
    }

    // particules de données
    const flux = [];
    for (let i = 0; i < N_FLUX; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      const r = 132 + Math.random() * 44;
      flux.push({
        cx: r * Math.cos(a) * Math.sin(b),
        cy: r * Math.cos(b) * 0.6,
        cz: r * Math.sin(a) * Math.sin(b),
        node: i % nodes.length,
        phase: Math.random(),
        seed: Math.random() * 10,
        rang: i / N_FLUX,
      });
    }
    const easeInOut = (t) => t * t * (3 - 2 * t);

    let W, H, cx0, cy0, scale;
    function resize() {
      const hr = hero.getBoundingClientRect();
      W = hr.width; H = hr.height;
      for (const [cv, cx] of [[canvasB, ctxB], [canvasF, ctxF]]) {
        cv.width = Math.round(W * DPR);
        cv.height = Math.round(H * DPR);
        cv.style.width = W + "px";
        cv.style.height = H + "px";
        cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      const pz = plaqueZone.getBoundingClientRect();
      cx0 = pz.left - hr.left + pz.width / 2;
      cy0 = pz.top - hr.top + pz.height / 2;
      scale = pz.width / 132;
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

    const F = 320;
    let running = true;
    const heroObs = new IntersectionObserver((es) => {
      es.forEach((e) => { running = e.isIntersecting; });
    });
    heroObs.observe(hero);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden && hero.getBoundingClientRect().bottom > 0;
    });

    const drawsB = [], drawsF = [];
    let t0 = null;

    function projette(p, cyaw, syaw, cpit, spit) {
      const x1 = p.x * cyaw + p.z * syaw;
      const z1 = -p.x * syaw + p.z * cyaw;
      const y2 = p.y * cpit - z1 * spit;
      const z2 = p.y * spit + z1 * cpit;
      const persp = F / (F + z2);
      return { sx: cx0 + x1 * scale * persp, sy: cy0 - y2 * scale * persp, z: z2, persp };
    }
    function pousse(pr, s, r, g, b, a, carre) {
      (pr.z >= 0 ? drawsB : drawsF).push({ z: pr.z, x: pr.sx, y: pr.sy, s, r, g, b, a, carre });
    }
    function ligne(cx, pts, style, width) {
      cx.strokeStyle = style;
      cx.lineWidth = width;
      cx.beginPath();
      pts.forEach((p, i) => (i === 0 ? cx.moveTo(p.sx, p.sy) : cx.lineTo(p.sx, p.sy)));
      cx.stroke();
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!running && !reducedMotion) return;
      if (t0 === null) t0 = now;
      const t = now - t0 + T_OFFSET;

      smx = lerp(smx, pmx, 0.045);
      smy = lerp(smy, pmy, 0.045);
      const yaw = t * 0.00014 + smx * 0.28;
      const pitch = -0.3 + smy * 0.11;
      const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      const cpit = Math.cos(pitch), spit = Math.sin(pitch);
      const yawF = -0.12 + smx * 0.08;
      const cyawF = Math.cos(yawF), syawF = Math.sin(yawF);

      const ordre = clamp(0.42 + scrollP * 0.58 + Math.min(t / 16000, 0.14), 0, 0.97);
      const alphaG = 1 - scrollP * 0.35;

      drawsB.length = 0;
      drawsF.length = 0;
      ctxB.clearRect(0, 0, W, H);
      ctxF.clearRect(0, 0, W, H);

      // anneaux (rotation propre)
      const wob = t * 0.0003;
      for (const [pts, sp, or] of [[ring1, 1, false], [ring2, -0.55, false], [ring3, 1.5, true]]) {
        const c2 = Math.cos(wob * sp), s2 = Math.sin(wob * sp);
        for (const p of pts) {
          const px = p.x * c2 + p.z * s2;
          const pz = -p.x * s2 + p.z * c2;
          const pr = projette({ x: px, y: p.y, z: pz }, cyaw, syaw, cpit, spit);
          pousse(pr, (or ? 1.2 : 1.45) * pr.persp,
            or ? 226 : 128, or ? 177 : 132, or ? 38 : 140,
            (or ? 0.6 : 0.42) * alphaG);
        }
      }

      // nœuds-outils + câbles courbes + impulsions
      nodes.forEach((n, i) => {
        const np = nodePos(n, ordre);
        const rp = rimPos(n, ordre);
        const pts = [];
        for (let u = 0; u <= 1.001; u += 0.1) {
          pts.push(projette(courbe(np, rp, u), cyaw, syaw, cpit, spit));
        }
        ligne(ctxB, pts, "rgba(167, 171, 178, " + (0.15 * alphaG).toFixed(3) + ")", 1);
        // impulsion lumineuse le long du câble
        const pu = ((t / 1500) + i * 0.37) % 1;
        const pp = projette(courbe(np, rp, easeInOut(pu)), cyaw, syaw, cpit, spit);
        pousse(pp, 2.2 * pp.persp, 242, 204, 85, (0.35 + ordre * 0.45) * alphaG);
        // le nœud
        const pr = projette(np, cyaw, syaw, cpit, spit);
        pousse(pr, 4.4 * pr.persp, 205, 208, 215, 0.9 * alphaG, true);
        pousse(pr, 8.5 * pr.persp, 226, 177, 38, 0.12 * ordre * alphaG);
      });

      // trajectoire de croissance (repère fixe) + flèche — au premier plan
      const ta = 0.3 + ordre * 0.55;
      const traj = [];
      for (let u = 0; u <= 1.001; u += 0.08) {
        traj.push(projette(sortiePos(u), cyawF, syawF, cpit, spit));
      }
      ligne(ctxF, traj, "rgba(226, 177, 38, " + (0.34 * ta * alphaG).toFixed(3) + ")", 1.5);
      const tip = traj[traj.length - 1];
      const avantT = traj[traj.length - 2];
      const ang = Math.atan2(tip.sy - avantT.sy, tip.sx - avantT.sx);
      ctxF.strokeStyle = "rgba(242, 204, 85, " + (0.85 * ta * alphaG).toFixed(3) + ")";
      ctxF.lineWidth = 2;
      ctxF.beginPath();
      ctxF.moveTo(tip.sx, tip.sy);
      ctxF.lineTo(tip.sx - 13 * Math.cos(ang - 0.45), tip.sy - 13 * Math.sin(ang - 0.45));
      ctxF.moveTo(tip.sx, tip.sy);
      ctxF.lineTo(tip.sx - 13 * Math.cos(ang + 0.45), tip.sy - 13 * Math.sin(ang + 0.45));
      ctxF.stroke();

      // particules de données
      for (const p of flux) {
        const organise = p.rang < ordre;
        if (!organise) {
          const w1 = t * 0.00038 + p.seed;
          const pr = projette({
            x: p.cx + Math.sin(w1) * 8,
            y: p.cy + Math.cos(w1 * 0.8) * 8,
            z: p.cz + Math.sin(w1 * 0.6) * 8,
          }, cyaw, syaw, cpit, spit);
          pousse(pr, 1.5 * pr.persp * (scale * 0.24 + 0.6), 127, 180, 217, 0.32 * alphaG);
          continue;
        }
        const u = ((t / CYCLE) + p.phase) % 1;
        const n = nodes[p.node];
        const np = nodePos(n, ordre);
        if (u < 0.36) {
          const k = easeInOut(u / 0.36);
          const pr = projette({
            x: lerp(p.cx, np.x, k), y: lerp(p.cy, np.y, k), z: lerp(p.cz, np.z, k),
          }, cyaw, syaw, cpit, spit);
          pousse(pr, 1.6 * pr.persp * (scale * 0.24 + 0.6),
            lerp(127, 226, k), lerp(180, 190, k), lerp(217, 110, k), (0.38 + k * 0.25) * alphaG);
        } else if (u < 0.6) {
          const k = easeInOut((u - 0.36) / 0.24);
          const pos = courbe(np, rimPos(n, ordre), k);
          const pr = projette(pos, cyaw, syaw, cpit, spit);
          pousse(pr, 1.8 * pr.persp * (scale * 0.24 + 0.6), 226, 177, 38, 0.7 * (1 - k * 0.5) * alphaG);
        } else {
          const k = easeInOut((u - 0.6) / 0.4);
          const pr = projette(sortiePos(k), cyawF, syawF, cpit, spit);
          drawsF.push({
            z: -1, x: pr.sx, y: pr.sy,
            s: (2 - k * 0.8) * pr.persp * (scale * 0.24 + 0.6),
            r: lerp(226, 242, k), g: lerp(177, 208, k), b: lerp(38, 90, k),
            a: 0.85 * (1 - Math.pow(k, 3)) * alphaG,
          });
        }
      }

      // tri du peintre puis rendu sur chaque canvas
      for (const [cx, arr] of [[ctxB, drawsB], [ctxF, drawsF]]) {
        arr.sort((a, b) => b.z - a.z);
        for (const d of arr) {
          if (d.a <= 0.02) continue;
          cx.globalAlpha = d.a;
          cx.fillStyle = "rgb(" + (d.r | 0) + "," + (d.g | 0) + "," + (d.b | 0) + ")";
          if (d.carre) cx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
          else {
            cx.beginPath();
            cx.arc(d.x, d.y, Math.max(d.s, 0.5), 0, Math.PI * 2);
            cx.fill();
          }
        }
        cx.globalAlpha = 1;
      }
    }

    if (reducedMotion) {
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
      window.addEventListener("resize", () => { resize(); once(); });
    } else {
      requestAnimationFrame(frame);
    }
  }
})();
