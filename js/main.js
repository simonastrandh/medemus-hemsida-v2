// Sätter aktuellt år i sidfoten
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Mobilmeny
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
if (navToggle && nav) {
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };
  navToggle.addEventListener("click", (event) => {
    event.stopPropagation(); // klicket ska aldrig nå dokumentets "klick utanför"-lyssnare
    setNav(!nav.classList.contains("is-open"));
  });
  // Stäng menyn: Esc, klick utanför, länkklick och när fönstret blir brett
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setNav(false);
      navToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const path = event.composedPath ? event.composedPath() : [];
    if (path.includes(nav) || path.includes(navToggle)) return;
    setNav(false);
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });
}

// Utfällbar lista (endast synlig på smala skärmar)
document.querySelectorAll("[data-collapsible]").forEach((box) => {
  const btn = box.querySelector(".v2-expand");
  const label = btn && btn.querySelector(".v2-expand__label");
  if (!btn || !label) return;
  btn.addEventListener("click", () => {
    const open = box.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", String(open));
    label.textContent = open ? btn.dataset.labelOpen : btn.dataset.labelClosed;
  });
});

// "Boka tid" i headern glider in från höger när den stora knappen scrollats förbi
// (på undersidor utan stor knapp efter en kort scroll).
// Menylänkarna ligger då längst till höger och glider åt vänster när knappen kommer in.
const heroCta = document.querySelector("[data-hero-cta]");
const header = document.querySelector(".v2-header");
const headerCta = document.querySelector(".v2-header__cta");
const headerNav = document.querySelector(".v2-nav");
if (header && headerCta && headerNav) {
  const measure = () => {
    // offsetLeft ignorerar transform, så måttet är stabilt oavsett animationens läge
    const shift = headerCta.offsetLeft + headerCta.offsetWidth - (headerNav.offsetLeft + headerNav.offsetWidth);
    // Ingen animation när måttet sätts (annars glider menyn på plats vid sidladdning)
    header.classList.add("is-measuring");
    header.style.setProperty("--cta-shift", Math.max(shift, 0) + "px");
    void header.offsetWidth;
    requestAnimationFrame(() => header.classList.remove("is-measuring"));
  };
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  const show = (on) => header.classList.toggle("is-cta-visible", on);
  if (header.dataset.cta === "always") {
    // Sidor där "Boka tid" ska synas från start
    show(true);
  } else if (heroCta && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => show(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-80px 0px 0px 0px" }
    ).observe(heroCta);
  } else {
    const onScroll = () => show(window.scrollY > (heroCta ? 240 : 160));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}

// Kopiera e-postadress
document.querySelectorAll("[data-copy]").forEach((btn) => {
  const field = btn.closest("[data-copy-field]");
  const label = btn.querySelector(".copy-field__label");
  const iconCopy = btn.querySelector("[data-icon-copy]");
  const iconDone = btn.querySelector("[data-icon-done]");
  const status = field && field.parentElement.querySelector("[data-copy-status]");
  let timer;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Reservlösning för äldre webbläsare / filvisning
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  btn.addEventListener("click", async () => {
    await copyText(btn.dataset.copy);
    clearTimeout(timer);
    if (field) field.classList.add("is-copied");
    if (label) label.textContent = "Kopierad";
    if (iconCopy) iconCopy.hidden = true;
    if (iconDone) iconDone.hidden = false;
    if (status) status.textContent = "E-postadressen kopierades";
    timer = setTimeout(() => {
      if (field) field.classList.remove("is-copied");
      if (label) label.textContent = "Kopiera";
      if (iconCopy) iconCopy.hidden = false;
      if (iconDone) iconDone.hidden = true;
      if (status) status.textContent = "";
    }, 2500);
  });
});

// Bokningsformulär: kontrollerar fälten och öppnar ett färdigt mejl till mottagningen
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  const status = bookingForm.querySelector(".form-status");
  const setError = (input, message) => {
    const err = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) {
      err.textContent = message;
      err.hidden = !message;
    }
  };
  const textFields = [
    ["namn", "Ditt namn", "namn"],
    ["personnummer", "Ditt personnummer", "personnummer"],
    ["email", "Din e-postadress", "e-postadress"],
    ["beskrivning", "Beskrivning av besvären", "beskrivning av besvären"],
    ["tid_med_besvar", "Hur länge besvären funnits", "hur länge besvären funnits"],
  ];
  const questions = [
    ["behandlingskontakt", "Pågående behandlingskontakt"],
    ["missbruk", "Missbruk (nu eller tidigare)"],
    ["mediciner", "Tar mediciner"],
    ["sjukskriven", "Sjukskriven"],
  ];

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const problems = [];
    for (const [id, , short] of textFields) {
      const input = bookingForm.elements[id];
      let message = "";
      if (!input.value.trim()) message = "Fyll i fältet.";
      else if (id === "email" && !/^\S+@\S+\.\S+$/.test(input.value.trim())) message = "Ange en giltig e-postadress.";
      setError(input, message);
      if (message) problems.push(short);
    }
    for (const [name] of questions) {
      if (!bookingForm.elements[name].value) problems.push("svar på alla Ja/Nej-frågor");
    }
    if (!bookingForm.elements.consent.checked) problems.push("godkännande av att uppgifterna sparas");

    const unique = [...new Set(problems)];
    status.classList.toggle("is-error", unique.length > 0);
    if (unique.length) {
      status.textContent = "Kontrollera: " + unique.join(", ") + ".";
      const firstInvalid = bookingForm.querySelector('[aria-invalid="true"]') || bookingForm.querySelector(".yesno input");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const lines = ["Hej!", "", "Jag vill boka en tid hos Medemus (egen remiss).", ""];
    for (const [id, label] of textFields) lines.push(label + ": " + bookingForm.elements[id].value.trim());
    lines.push("");
    for (const [name, label] of questions) lines.push(label + ": " + bookingForm.elements[name].value);
    const extra = bookingForm.elements.meddelande.value.trim();
    if (extra) lines.push("", "Meddelande: " + extra);
    const href = "mailto:kontakt@medemus.se?subject=" + encodeURIComponent("Bokningsförfrågan – egen remiss") + "&body=" + encodeURIComponent(lines.join("\n"));
    status.textContent = "Ditt e-postprogram öppnas med din förfrågan. Skicka mejlet så kontaktar vi dig.";
    window.location.href = href;
  });
}

// Dragspel: mjuk och snabb animation när ett kort öppnas eller stängs
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll("details.acc").forEach((det) => {
  const summary = det.querySelector("summary");
  const body = det.querySelector(".acc__body");
  if (!summary || !body || typeof det.animate !== "function") return;
  let anim = null;

  const run = (from, to, onDone) => {
    if (anim) anim.cancel();
    det.style.overflow = "hidden";
    anim = det.animate({ height: [from + "px", to + "px"] }, { duration: 220, easing: "ease" });
    anim.onfinish = anim.oncancel = () => {
      det.style.overflow = "";
      anim = null;
      if (onDone) onDone();
    };
  };

  summary.addEventListener("click", (event) => {
    if (reduceMotion.matches) return; // utan animation: webbläsarens standardbeteende
    event.preventDefault();
    const startHeight = det.offsetHeight;
    if (!det.open) {
      det.open = true;
      run(startHeight, det.offsetHeight);
    } else {
      const closedHeight = startHeight - body.offsetHeight;
      run(startHeight, closedHeight, () => { det.open = false; });
    }
  });
});
