/* ============================================================
   CARROSSERIE LOMRYE — moteur du site
   Aucune dépendance externe. Voir config.js pour les contenus.
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.LOMRYE_CONFIG;
  if (!CFG) {
    console.error("config.js manquant : le site ne peut pas s'initialiser.");
    return;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const narrowQuery = window.matchMedia("(max-width: 780px)");
  const isNarrow = narrowQuery.matches; // STEP/DPR figés au chargement (voulu)

  const $ = (sel) => document.querySelector(sel);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ========================================================
     INJECTION DES CONTENUS DEPUIS LA CONFIG
     ======================================================== */
  document.getElementById("year").textContent = new Date().getFullYear();

  const telHref = "tel:" + CFG.telephoneLien;
  const waHref =
    "https://wa.me/" + String(CFG.telephoneLien || "").replace(/[^0-9]/g, "") +
    "?text=" + encodeURIComponent("Bonjour, je souhaite un devis carrosserie. Je vous envoie des photos des dommages.");

  $("#btnCall").href = telHref;
  $("#mbCall").href = telHref;
  $("#btnWa").href = waHref;
  $("#mbWa").href = waHref;
  $("#phoneLabel").textContent = CFG.telephoneAffiche;
  $("#mapCard").href = CFG.googleMapsUrl;
  $("#mapInfo").innerHTML =
    "<b>" + CFG.nom + "</b><span>" + CFG.adresse.rue + " · " + CFG.adresse.codePostal + " " + CFG.adresse.ville + "</span>";
  $("#footerAddr").textContent =
    CFG.adresse.rue + ", " + CFG.adresse.codePostal + " " + CFG.adresse.ville;

  $("#legalEditeur").textContent =
    CFG.nom + " — " + CFG.legal.formeJuridique + " — SIRET : " + CFG.legal.siret +
    " — " + CFG.adresse.rue + ", " + CFG.adresse.codePostal + " " + CFG.adresse.ville;
  $("#legalResponsable").textContent = CFG.legal.responsable;
  $("#legalHebergeur").textContent = CFG.legal.hebergeur;
  $("#legalEmail").textContent = CFG.email;

  // Bandeau de confiance (doublé pour une boucle sans couture)
  const trustTrack = $("#trustTrack");
  const trustHTML = CFG.bandeauConfiance
    .map((t) => '<span class="trust-item">' + t + "</span>")
    .join("");
  trustTrack.innerHTML =
    trustHTML + '<span class="trust-dup" aria-hidden="true">' + trustHTML + "</span>";

  // Avis
  const avisGrid = $("#avisGrid");
  avisGrid.innerHTML = CFG.avis
    .map(
      (a) =>
        '<figure class="avis-card reveal">' +
        '<div class="avis-stars" aria-label="' + a.note + ' étoiles sur 5">' + "★".repeat(a.note) + "</div>" +
        "<blockquote>« " + a.texte + " »</blockquote>" +
        "<figcaption>" + a.nom + "</figcaption>" +
        "</figure>"
    )
    .join("");
  if (!CFG.avisDemo) $("#avisDemoChip").style.display = "none";

  // Contact
  const horairesHTML = CFG.horaires
    .map(
      (h) =>
        '<div class="hours-line"><span>' + h.jours + '</span><span class="h">' + h.heures + "</span></div>"
    )
    .join("");
  const reseauxHTML = CFG.reseaux
    .map((r) => {
      if (r.url) {
        return '<a href="' + r.url + '" target="_blank" rel="noopener">' + r.nom + "</a>";
      }
      if (r.pseudo) return "<span>" + r.nom + " : <b>" + r.pseudo + "</b></span>";
      return "";
    })
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");
  $("#contactList").innerHTML =
    '<div class="contact-row"><span class="k">Adresse</span><span class="v"><b>' +
    CFG.adresse.rue + "</b><br>" + CFG.adresse.codePostal + " " + CFG.adresse.ville +
    ' — <a href="' + CFG.googleMapsUrl + '" target="_blank" rel="noopener">itinéraire</a></span></div>' +
    '<div class="contact-row"><span class="k">Téléphone</span><span class="v"><b><a href="' + telHref + '" style="border:none">' +
    CFG.telephoneAffiche + "</a></b><br>" + CFG.depannage + "</span></div>" +
    '<div class="contact-row"><span class="k">E-mail</span><span class="v"><a href="mailto:' + CFG.email + '">' + CFG.email + "</a></span></div>" +
    '<div class="contact-row"><span class="k">Horaires</span><span class="v" style="flex:1">' + horairesHTML + "</span></div>" +
    (reseauxHTML ? '<div class="contact-row"><span class="k">Réseaux</span><span class="v">' + reseauxHTML + "</span></div>" : "");

  /* ========================================================
     NAVIGATION
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
     APPARITIONS
     ======================================================== */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  const observeReveals = (root) =>
    (root || document).querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ========================================================
     TILT LÉGER SUR LES CARTES SERVICES
     ======================================================== */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform =
          "perspective(900px) rotateX(" + ((0.5 - py) * 4).toFixed(2) + "deg) rotateY(" +
          ((px - 0.5) * 4).toFixed(2) + "deg)";
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
     ILLUSTRATIONS AVANT / APRÈS (démo, remplaçables par photos)
     ======================================================== */
  let svgUid = 0;
  function carSVG(variante, etat) {
    svgUid++;
    const uid = "g" + svgUid;
    const repaired = etat === "apres";

    // Gabarits par type de véhicule
    const shapes = {
      berline: {
        body: "M96 218 C96 190 120 178 150 172 L200 118 C214 100 238 88 268 86 L430 84 C470 84 506 100 534 128 L570 166 C606 172 632 186 632 214 L630 236 C630 246 622 252 612 252 L118 252 C106 252 96 244 96 232 Z",
        winB: "M225 122 C238 106 258 98 276 97 L340 96 L338 160 L212 160 Z",
        winF: "M362 96 L470 95 C496 98 518 112 536 132 L556 158 L360 160 Z",
        wheels: [[210, 242], [520, 242]],
        wr: 40,
      },
      suv: {
        body: "M92 210 C92 184 116 172 148 168 L178 106 C190 86 216 74 248 72 L452 72 C492 72 524 88 548 116 L578 158 C612 164 636 180 636 208 L634 234 C634 246 626 252 614 252 L114 252 C102 252 92 244 92 228 Z",
        winB: "M204 110 C216 92 238 84 260 83 L336 82 L334 152 L188 152 Z",
        winF: "M358 82 L448 81 C478 84 502 98 522 124 L542 150 L356 152 Z",
        wheels: [[204, 240], [528, 240]],
        wr: 44,
      },
      citadine: {
        body: "M130 214 C130 190 152 178 180 172 L210 116 C224 96 250 86 280 85 L420 84 C456 84 486 98 508 124 L536 162 C568 168 592 184 592 210 L590 234 C590 246 582 252 570 252 L152 252 C140 252 130 244 130 230 Z",
        winB: "M234 120 C246 102 266 95 284 94 L346 93 L344 158 L220 158 Z",
        winF: "M366 93 L418 92 C448 95 470 110 488 134 L506 156 L364 158 Z",
        wheels: [[232, 242], [492, 242]],
        wr: 38,
      },
    };
    const s = shapes[variante] || shapes.berline;

    const paint = repaired
      ? 'fill="url(#paint' + uid + ')" stroke="#a34a0c"'
      : 'fill="#46464c" stroke="#2c2c31"';

    // Dommages spécifiques à chaque scénario (état « avant » uniquement)
    let damage = "";
    if (!repaired) {
      if (variante === "berline") {
        damage =
          '<ellipse cx="560" cy="196" rx="26" ry="14" fill="#333338"/>' +
          '<ellipse cx="556" cy="192" rx="13" ry="7" fill="#27272c"/>' +
          '<path d="M470 200 l60 9 M480 214 l44 6" stroke="#27272c" stroke-width="4" stroke-linecap="round" fill="none"/>' +
          '<path d="M612 208 c12 2 16 10 15 20 l-22 2 Z" fill="#38383e"/>' +
          '<path d="M598 196 l12 10 m-12-10 l-3 14 m3-14 l14 2" stroke="#8a8a92" stroke-width="2" fill="none" stroke-linecap="round"/>';
      } else if (variante === "suv") {
        damage =
          '<path d="M92 210 C92 196 100 188 112 184 L118 252 L114 252 C102 252 92 244 92 228 Z" fill="#333338"/>' +
          '<path d="M100 200 l30 14 m-28 2 l24 12 m-26-40 l20 34" stroke="#1f1f24" stroke-width="3" fill="none" stroke-linecap="round"/>' +
          '<path d="M96 246 l26 -8 l4 14 l-24 0 Z" fill="#27272c"/>';
      } else {
        let dents = "";
        const spots = [[300, 100], [345, 96], [390, 95], [430, 100], [470, 112], [270, 112], [330, 130], [430, 130], [380, 118], [500, 140]];
        for (const [dx, dy] of spots) {
          dents +=
            '<ellipse cx="' + dx + '" cy="' + dy + '" rx="9" ry="5" fill="rgba(20,20,24,0.55)"/>' +
            '<ellipse cx="' + (dx - 2) + '" cy="' + (dy - 1.5) + '" rx="4" ry="2" fill="rgba(120,120,128,0.35)"/>';
        }
        damage = dents;
      }
    }

    const shine = repaired
      ? '<path d="M150 178 C240 166 480 164 580 180 L574 170 C490 156 250 158 162 172 Z" fill="url(#shine' + uid + ')" opacity="0.7"/>' +
        '<rect x="140" y="184" width="440" height="5" rx="2.5" fill="rgba(255,255,255,0.26)"/>'
      : "";

    const wheels = s.wheels
      .map(([wx, wy]) => {
        const spokes = repaired
          ? '<g stroke="#8a8a92" stroke-width="3"><path d="M' + wx + " " + (wy - 16) + " v32 M" + (wx - 16) + " " + wy + " h32 M" +
            (wx - 11) + " " + (wy - 11) + " l22 22 M" + (wx + 11) + " " + (wy - 11) + ' l-22 22"/></g>' +
            '<circle cx="' + wx + '" cy="' + wy + '" r="6" fill="#f97316"/>'
          : '<circle cx="' + wx + '" cy="' + wy + '" r="6" fill="#3c3c42"/>';
        return (
          '<circle cx="' + wx + '" cy="' + wy + '" r="' + s.wr + '" fill="#121216" stroke="' + (repaired ? "#3c3c42" : "#28282d") + '" stroke-width="4"/>' +
          '<circle cx="' + wx + '" cy="' + wy + '" r="' + Math.round(s.wr * 0.5) + '" fill="#26262c"/>' + spokes
        );
      })
      .join("");

    return (
      '<svg viewBox="0 0 720 300" role="img" aria-label="' +
      (repaired ? "Véhicule réparé" : "Véhicule endommagé") + '">' +
      "<defs>" +
      '<linearGradient id="paint' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#fb923c"/><stop offset="0.45" stop-color="#f97316"/><stop offset="1" stop-color="#b45309"/></linearGradient>' +
      '<linearGradient id="shine' + uid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="0.5" stop-color="rgba(255,255,255,0.5)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>' +
      "</defs>" +
      '<ellipse cx="360" cy="262" rx="290" ry="14" fill="rgba(0,0,0,0.5)"/>' +
      '<path d="' + s.body + '" ' + paint + ' stroke-width="3"/>' +
      '<path d="' + s.winB + '" fill="' + (repaired ? "#1c2733" : "#232329") + '" stroke="' + (repaired ? "#39444f" : "#38383f") + '" stroke-width="2"/>' +
      '<path d="' + s.winF + '" fill="' + (repaired ? "#1c2733" : "#232329") + '" stroke="' + (repaired ? "#39444f" : "#38383f") + '" stroke-width="2"/>' +
      shine + damage + wheels +
      "</svg>"
    );
  }

  /* ========================================================
     GALERIE RÉALISATIONS + CURSEURS AVANT/APRÈS
     ======================================================== */
  const realGrid = $("#realGrid");
  realGrid.innerHTML = CFG.realisations
    .map((p, i) => {
      const avant = p.photoAvant
        ? '<img src="' + p.photoAvant + '" alt="Avant réparation — ' + p.vehicule + '" loading="lazy" draggable="false">'
        : carSVG(p.variante, "avant");
      const apres = p.photoApres
        ? '<img src="' + p.photoApres + '" alt="Après réparation — ' + p.vehicule + '" loading="lazy" draggable="false">'
        : carSVG(p.variante, "apres");
      return (
        '<div class="real-item reveal">' +
        '<div class="ba" role="slider" tabindex="0" aria-label="Comparateur avant après — ' + p.vehicule +
        '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-orientation="horizontal">' +
        '<span class="ba-label ba-label-avant">Avant</span>' +
        '<span class="ba-label ba-label-apres">Après</span>' +
        '<div class="ba-img ba-before">' + avant + "</div>" +
        '<div class="ba-img ba-after">' + apres + "</div>" +
        '<div class="ba-bar"></div><div class="ba-knob">⇄</div>' +
        "</div>" +
        '<div class="real-meta">' +
        '<span class="mono-tag">Projet ' + String(i + 1).padStart(2, "0") + "</span>" +
        "<h3>" + p.vehicule + "</h3>" +
        '<ul class="real-specs">' +
        '<li><span class="k">Dommages</span><span class="v">' + p.dommages + "</span></li>" +
        '<li><span class="k">Intervention</span><span class="v">' + p.intervention + "</span></li>" +
        '<li><span class="k">Durée</span><span class="v">' + p.duree + "</span></li>" +
        "</ul></div></div>"
      );
    })
    .join("");

  document.querySelectorAll(".ba").forEach((ba) => {
    let dragging = false;
    const set = (pct) => {
      pct = clamp(pct, 2, 98);
      ba.style.setProperty("--cut", pct + "%");
      ba.setAttribute("aria-valuenow", Math.round(pct));
    };
    const fromEvent = (e) => {
      const r = ba.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    ba.addEventListener("pointerdown", (e) => {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    ba.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", () => { dragging = false; });
    ba.addEventListener("pointercancel", () => { dragging = false; });
    ba.addEventListener("keydown", (e) => {
      const cur = parseFloat(ba.getAttribute("aria-valuenow"));
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { set(cur - 5); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { set(cur + 5); e.preventDefault(); }
      if (e.key === "Home") { set(2); e.preventDefault(); }
      if (e.key === "End") { set(98); e.preventDefault(); }
    });
    // Démonstration du curseur à l'apparition
    if (!reducedMotion) {
      const demoObs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          demoObs.unobserve(en.target);
          let t = 0;
          const id = setInterval(() => {
            t += 0.03;
            if (t >= Math.PI * 2 || dragging) { clearInterval(id); return; }
            set(50 + Math.sin(t) * 28);
          }, 16);
        });
      }, { threshold: 0.5 });
      demoObs.observe(ba);
    }
  });

  /* ========================================================
     MÉTHODE — progression liée au scroll
     ======================================================== */
  const methodWrap = $("#methodWrap");
  const methodFill = $("#methodFill");
  const msteps = Array.from(document.querySelectorAll(".mstep"));
  function updateMethod() {
    const r = methodWrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
    methodFill.style.height = (progress * 100).toFixed(1) + "%";
    const filledPx = progress * r.height;
    msteps.forEach((st) => {
      st.classList.toggle("active", st.offsetTop + 34 <= filledPx);
    });
  }
  if (reducedMotion) {
    methodFill.style.height = "100%";
    msteps.forEach((s) => s.classList.add("active"));
  } else {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateMethod(); ticking = false; });
    }, { passive: true });
    updateMethod();
  }

  /* ========================================================
     DIALOGS LÉGAUX
     ======================================================== */
  const dlgMentions = $("#dlgMentions");
  const dlgPrivacy = $("#dlgPrivacy");
  const openDlg = (d) => (d.showModal ? d.showModal() : d.setAttribute("open", ""));
  const closeDlg = (d) => (d.close ? d.close() : d.removeAttribute("open"));
  $("#openMentions").addEventListener("click", () => openDlg(dlgMentions));
  $("#openPrivacy").addEventListener("click", () => openDlg(dlgPrivacy));
  $("#openPrivacy2").addEventListener("click", (e) => { e.preventDefault(); openDlg(dlgPrivacy); });
  document.querySelectorAll(".close-dialog").forEach((b) =>
    b.addEventListener("click", () => closeDlg(document.getElementById(b.dataset.close)))
  );

  // Retour visuel des puces radio sans :has() (anciens Safari)
  document.querySelectorAll(".chip input").forEach((input) => {
    const sync = () => {
      document.querySelectorAll('.chip input[name="' + input.name + '"]').forEach((other) =>
        other.closest(".chip").classList.toggle("checked", other.checked)
      );
    };
    input.addEventListener("change", sync);
    input.addEventListener("focus", () => input.closest(".chip").classList.add("focused"));
    input.addEventListener("blur", () => input.closest(".chip").classList.remove("focused"));
    if (input.checked) input.closest(".chip").classList.add("checked");
  });

  /* ========================================================
     FORMULAIRE DE DEVIS — sans faux envoi
     ======================================================== */
  const form = $("#quoteForm");
  const formStatus = $("#formStatus");
  const formNote = $("#formNote");
  const photoInput = $("#qPhotos");
  const photoDrop = $("#photoDrop");
  const photoPreviews = $("#photoPreviews");
  const MAX_PHOTOS = 6;
  let photos = [];

  formNote.textContent = CFG.formEndpoint
    ? "Vos données sont transmises de façon sécurisée et utilisées uniquement pour votre devis."
    : "Démo : l'envoi ouvre votre messagerie e-mail avec la demande pré-remplie (voir README pour brancher un envoi serveur).";

  photoDrop.addEventListener("click", () => photoInput.click());
  photoDrop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoInput.click(); }
  });
  photoDrop.addEventListener("dragover", (e) => { e.preventDefault(); photoDrop.style.borderColor = "var(--orange)"; });
  photoDrop.addEventListener("dragleave", () => { photoDrop.style.borderColor = ""; });
  photoDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    photoDrop.style.borderColor = "";
    addPhotos(e.dataTransfer.files);
  });
  photoInput.addEventListener("change", () => { addPhotos(photoInput.files); photoInput.value = ""; });

  function addPhotos(fileList) {
    for (const f of fileList) {
      if (!f.type.startsWith("image/")) continue;
      if (photos.length >= MAX_PHOTOS) break;
      photos.push({ file: f, url: URL.createObjectURL(f) });
    }
    renderPhotos();
  }
  function renderPhotos() {
    photoPreviews.innerHTML = "";
    photos.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "photo-thumb";
      const img = document.createElement("img");
      img.src = p.url;
      img.alt = "Photo " + (i + 1);
      const rm = document.createElement("button");
      rm.type = "button";
      rm.textContent = "×";
      rm.setAttribute("aria-label", "Retirer la photo " + (i + 1));
      rm.addEventListener("click", () => {
        URL.revokeObjectURL(p.url);
        photos.splice(i, 1);
        renderPhotos();
      });
      div.appendChild(img);
      div.appendChild(rm);
      photoPreviews.appendChild(div);
    });
  }

  function setStatus(kind, msg) {
    formStatus.className = "form-status show " + kind;
    formStatus.textContent = msg;
  }

  function validate() {
    let firstInvalid = null;
    const mark = (input, bad) => {
      const field = input.closest(".field");
      field.classList.toggle("invalid", bad);
      if (bad && !firstInvalid) firstInvalid = input;
    };
    const nom = $("#qNom"), tel = $("#qTel"), email = $("#qEmail"),
      veh = $("#qVehicule"), dom = $("#qDommage"), consent = $("#qConsent");
    mark(nom, nom.value.trim().length < 2);
    mark(tel, (tel.value.replace(/[^0-9+]/g, "").length) < 9);
    mark(email, email.value.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    mark(veh, veh.value.trim().length < 2);
    mark(dom, !dom.value);
    const consentErr = $("#consentErr");
    consentErr.style.display = consent.checked ? "none" : "block";
    if (!consent.checked && !firstInvalid) firstInvalid = consent;
    if (firstInvalid) { firstInvalid.focus(); return false; }
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatus("warn", "Merci de compléter les champs signalés ci-dessus.");
      return;
    }
    const data = new FormData(form);
    photos.forEach((p, i) => data.append("photo_" + (i + 1), p.file, p.file.name));

    if (CFG.formEndpoint) {
      const btn = $("#submitBtn");
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";
      try {
        const res = await fetch(CFG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus("ok", "Demande envoyée. Nous vous recontactons rapidement — merci !");
        form.reset();
        photos.forEach((p) => URL.revokeObjectURL(p.url));
        photos = [];
        renderPhotos();
      } catch (err) {
        setStatus("warn", "L'envoi a échoué (" + err.message + "). Appelez-nous au " + CFG.telephoneAffiche + " ou réessayez.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Envoyer ma demande de devis";
      }
    } else {
      // Aucun backend connecté : on prépare un e-mail, sans simuler d'envoi réussi.
      const lignes = [
        "Demande de devis — " + CFG.nom,
        "",
        "Nom : " + data.get("nom"),
        "Téléphone : " + data.get("telephone"),
        "E-mail : " + (data.get("email") || "—"),
        "Véhicule : " + data.get("vehicule"),
        "Immatriculation : " + (data.get("immatriculation") || "—"),
        "Type de dommage : " + data.get("dommage"),
        "Contact préféré : " + data.get("contactPref"),
        "",
        "Message :",
        data.get("message") || "—",
        "",
        (photos.length ? "⚠ Pensez à joindre vos " + photos.length + " photo(s) à cet e-mail." : ""),
      ];
      const mailto =
        "mailto:" + CFG.email +
        "?subject=" + encodeURIComponent("Demande de devis — " + data.get("vehicule")) +
        "&body=" + encodeURIComponent(lignes.join("\n"));
      setStatus(
        "ok",
        "Votre messagerie va s'ouvrir avec la demande pré-remplie" +
        (photos.length ? " — pensez à y joindre vos photos." : ".") +
        " (Formulaire non relié à un serveur sur cette démo.)"
      );
      window.location.href = mailto;
    }
  });

  /* ========================================================
     SCÈNE VOXEL 3D DU HERO
     Voiture en « pixels » : assemblage, réparation par balayage
     lumineux, parallaxe souris, désintégration au scroll.
     ======================================================== */
  const canvas = $("#voxelCanvas");
  const hero = $(".hero");
  const ctx = canvas.getContext && canvas.getContext("2d");

  if (ctx) {
    const STEP = isNarrow ? 2.7 : 2;
    const DPR = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2);

    /* ----- Géométrie de la voiture (repère : x longueur, y hauteur, z largeur) ----- */
    const lerp = (a, b, t) => a + (b - a) * t;
    function yTop(x) {
      if (x > 42) return lerp(9.5, 8.5, (x - 42) / 8);      // nez
      if (x > 15) return lerp(13.5, 9.5, (x - 15) / 27);    // capot
      if (x > 2) return lerp(23.5, 13.5, (x - 2) / 13);     // pare-brise
      if (x > -26) return lerp(22.5, 23.5, (x + 26) / 28);  // pavillon
      if (x > -44) return lerp(11.5, 22.5, (x + 44) / 18);  // fastback
      return lerp(13, 11.5, (x + 50) / 6);                  // becquet
    }
    function halfW(x, y) {
      let w = 13;
      if (x > 40) w -= (x - 40) * 0.5;
      if (x < -42) w -= (-42 - x) * 0.45;
      if (y > 13.5) w = Math.min(w, 8.5);
      else if (y > 11) w *= 0.96;
      return Math.max(w, 2);
    }
    function inside(x, y, z) {
      if (y < 3 || y > yTop(x)) return false;
      if (Math.abs(z) > halfW(x, y)) return false;
      // passages de roues
      if (y < 11) {
        const d1 = Math.hypot(x - 30, y - 3);
        const d2 = Math.hypot(x + 30, y - 3);
        if (d1 < 8.6 || d2 < 8.6) return false;
      }
      return true;
    }

    const pts = [];
    const COL = {
      body: [172, 175, 184],
      skirt: [96, 98, 108],
      glass: [38, 46, 60],
      accent: [249, 115, 22],
      tire: [30, 30, 36],
      rim: [205, 207, 215],
      hub: [249, 115, 22],
      dmg: [92, 92, 98],
    };
    function pushPt(tx, ty, tz, col, opts) {
      const orig = opts && opts.orig ? opts.orig : col;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      const rad = 130 + Math.random() * 110;
      pts.push({
        tx, ty, tz,
        sx: Math.cos(a) * Math.sin(b) * rad,
        sy: Math.sin(a) * Math.sin(b) * rad * 0.7 + 10,
        sz: Math.cos(b) * rad,
        col,
        orig,
        delay: 150 + Math.random() * 1300,
        fly: [Math.cos(a) * (40 + Math.random() * 90), (Math.random() - 0.2) * 90, Math.sin(a) * (40 + Math.random() * 90)],
        dmg: opts && opts.dmg ? [(Math.random() - 0.3) * 5, (Math.random() - 0.2) * 4, (Math.random() + 0.4) * 3.5] : null,
        rp: 0,
      });
    }

    // Carrosserie (coque uniquement : voxels de surface)
    for (let x = -50; x <= 50; x += STEP) {
      for (let y = 3; y <= 26; y += STEP) {
        for (let z = -14; z <= 14; z += STEP) {
          if (!inside(x, y, z)) continue;
          const shell =
            !inside(x + STEP, y, z) || !inside(x - STEP, y, z) ||
            !inside(x, y + STEP, z) || !inside(x, y - STEP, z) ||
            !inside(x, y, z + STEP) || !inside(x, y, z - STEP);
          if (!shell) continue;
          let col = COL.body;
          const top = yTop(x);
          if (y > 14 && top - y < 3.4) col = COL.glass;
          else if (y < 5) col = COL.skirt;
          else if (y >= 8 && y < 10 && Math.abs(z) >= halfW(x, y) - STEP * 0.6) col = COL.accent;
          const damaged = x > 20 && z > 4 && y < 13 && col !== COL.glass;
          pushPt(x, y, z, damaged ? COL.dmg : col, { dmg: damaged, orig: col });
        }
      }
    }
    // Roues
    for (const wx of [30, -30]) {
      for (const wz of [12.5, -12.5]) {
        for (let ai = 0; ai < 22; ai++) {
          const ang = (ai / 22) * Math.PI * 2;
          for (const r of [4.2, 5.8, 7.2, 8.4]) {
            const col = r > 6.8 ? COL.tire : r > 3 ? COL.rim : COL.hub;
            pushPt(wx + Math.cos(ang) * r, 3 + Math.sin(ang) * r, wz + (Math.random() - 0.5) * 1.6, col);
          }
        }
        pushPt(wx, 3, wz, COL.hub);
      }
    }

    /* ----- Rendu ----- */
    let W, H, cx, cy, scale;
    function resize() {
      const rect = hero.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (narrowQuery.matches) {
        cx = W * 0.5; cy = H * 0.30;
        scale = (W * 0.95) / 118;
      } else {
        cx = W * 0.64; cy = H * 0.36;
        scale = Math.min(W * 0.56, H * 0.86) / 112;
      }
    }
    window.addEventListener("resize", resize);
    resize();

    let mx = 0, my = 0, smx = 0, smy = 0;
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }

    let scrollD = 0;
    window.addEventListener("scroll", () => {
      scrollD = clamp((window.scrollY / (H * 0.85)), 0, 1);
    }, { passive: true });

    const F = 330;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const order = pts.map((_, i) => i);
    // ?vt=<ms> : avance la timeline (outil de vérification visuelle)
    const T_OFFSET = parseFloat(new URLSearchParams(location.search).get("vt")) || 0;
    let t0 = null; // ancré sur la première frame réellement peinte
    let running = true;

    const heroObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { running = e.isIntersecting; });
    });
    heroObs.observe(hero);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) running = false;
      else if (isHeroVisible()) running = true;
    });
    function isHeroVisible() {
      const r = hero.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!running && !reducedMotion) return;
      if (t0 === null) t0 = now;

      const t = now - t0 + T_OFFSET;
      smx = lerp(smx, mx, 0.05);
      smy = lerp(smy, my, 0.05);

      const yaw = -0.62 + Math.sin(t * 0.00022) * 0.05 + smx * 0.24;
      const pitch = -0.16 + smy * 0.09;
      const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      const cpit = Math.cos(pitch), spit = Math.sin(pitch);

      // balayage « réparation » puis balayages lumineux périodiques
      let sweepX = null;
      const tR = 2600, dR = 1900;
      if (t > tR && t < tR + dR) {
        sweepX = 62 - 124 * ((t - tR) / dR);
      } else if (t > tR + dR) {
        const cyc = (t - tR - dR) % 6500;
        if (cyc < 1500) sweepX = -70 + (cyc / 1500) * 140;
      }
      // réparation déterministe : chaque voxel abîmé se répare quand
      // le balayage franchit sa position (fonction pure du temps)
      for (const p of pts) {
        if (!p.dmg) continue;
        const tPass = tR + (dR * (62 - p.tx)) / 124;
        p.rp = easeOut(clamp((t - tPass) / 450, 0, 1));
      }

      const explode = easeOut(scrollD);
      const globalAlpha = 1 - scrollD * 0.9;

      // profondeur + tri (peintre)
      for (const p of pts) {
        const ap = easeOut(clamp((t - p.delay) / 1100, 0, 1));
        let x = p.tx, y = p.ty, z = p.tz;
        if (p.dmg) {
          const k = 1 - p.rp;
          x += p.dmg[0] * k; y += p.dmg[1] * k; z += p.dmg[2] * k;
        }
        x = lerp(p.sx, x, ap);
        y = lerp(p.sy, y, ap);
        z = lerp(p.sz, z, ap);
        if (explode > 0) {
          x += p.fly[0] * explode;
          y += p.fly[1] * explode;
          z += p.fly[2] * explode;
        }
        const x1 = x * cyaw + z * syaw;
        const z1 = -x * syaw + z * cyaw;
        const y2 = y * cpit - z1 * spit;
        const z2 = y * spit + z1 * cpit;
        p._x = x1; p._y = y2; p._z = z2; p._ap = ap;
      }
      order.sort((a, b) => pts[b]._z - pts[a]._z); // peintre : lointain d'abord

      ctx.clearRect(0, 0, W, H);

      // halo de sol sous le véhicule (l'ancre visuellement)
      const floorA = clamp((t - 900) / 1500, 0, 1) * globalAlpha * 0.5;
      if (floorA > 0.01) {
        const fy = cy + 9 * scale;
        const grd = ctx.createRadialGradient(cx, fy, 0, cx, fy, 56 * scale);
        grd.addColorStop(0, "rgba(249, 115, 22, " + (0.10 * floorA).toFixed(3) + ")");
        grd.addColorStop(0.4, "rgba(160, 160, 170, " + (0.05 * floorA).toFixed(3) + ")");
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grd;
        ctx.save();
        ctx.translate(cx, fy);
        ctx.scale(1, 0.22);
        ctx.translate(-cx, -fy);
        ctx.beginPath();
        ctx.arc(cx, fy, 56 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const i of order) {
        const p = pts[i];
        if (p._ap <= 0.01) continue;
        const persp = F / (F + p._z);
        if (persp <= 0) continue;
        const px = cx + p._x * scale * persp;
        const py = cy - p._y * scale * persp;
        const size = Math.max(1.2, STEP * scale * persp * 0.92);

        // éclairage : plafonnier + balayage chrome
        let shade = 0.72 + 0.28 * (p.ty / 26);
        let boost = 0;
        if (sweepX !== null) {
          const d = p.tx - sweepX;
          boost = Math.exp(-(d * d) / 70) * 0.9;
        }
        let cr = p.col[0], cg = p.col[1], cb = p.col[2];
        if (p.dmg && p.rp > 0) {
          // retour progressif à la teinte d'origine du voxel
          cr = lerp(cr, p.orig[0], p.rp);
          cg = lerp(cg, p.orig[1], p.rp);
          cb = lerp(cb, p.orig[2], p.rp);
        }
        const r = Math.min(255, cr * shade + 235 * boost);
        const g = Math.min(255, cg * shade + 237 * boost);
        const b = Math.min(255, cb * shade + 240 * boost);
        const a = p._ap * globalAlpha;
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    if (reducedMotion) {
      // Version statique : voiture assemblée et réparée, un seul rendu
      for (const p of pts) { p.delay = -10000; p.rp = 1; }
      const once = () => {
        running = true;
        t0 = 0;
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = () => 0; // neutralise la boucle
        frame(60000);
        window.requestAnimationFrame = raf;
      };
      once();
      window.addEventListener("resize", once);
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* ========================================================
     OBSERVATION FINALE DES REVEALS (après injections DOM)
     ======================================================== */
  observeReveals(document);
})();
