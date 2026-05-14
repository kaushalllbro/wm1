// WebMitra global app.js
// Handles: nav highlight, mobile menu, year, WhatsApp links, scroll reveal,
// FAQ accordion, card mouse glow, simple countdown.

(function () {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const normalized = path === "" ? "index.html" : path;

  // Mobile menu toggle
  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-menu-toggle]");
    if (t) {
      const links = document.querySelector(".nav-links");
      if (links) links.classList.toggle("open");
      return;
    }
    // Close menu when clicking a link inside
    if (e.target.closest(".nav-links a")) {
      const links = document.querySelector(".nav-links");
      if (links && links.classList.contains("open")) links.classList.remove("open");
    }
  });

  // Active nav highlight
  document.querySelectorAll(".nav-links a[data-nav]").forEach((a) => {
    if (a.getAttribute("data-nav") === normalized) a.classList.add("active");
  });

  // WhatsApp helpers
  const waNumber = "919448249141";
  const waMsg = encodeURIComponent("Hi WebMitra, I would like to know more about your websites.");
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${waNumber}?text=${waMsg}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Year
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Scroll reveal
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Card mouse glow
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  // FAQ accordion
  document.querySelectorAll(".faq-item .faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      item.classList.toggle("open");
    });
  });

  // Countdown (data-countdown="2026-12-25T19:00")
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const target = new Date(el.getAttribute("data-countdown")).getTime();
    if (isNaN(target)) return;
    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      el.querySelectorAll("[data-cd-d]").forEach((n) => (n.textContent = String(d).padStart(2, "0")));
      el.querySelectorAll("[data-cd-h]").forEach((n) => (n.textContent = String(h).padStart(2, "0")));
      el.querySelectorAll("[data-cd-m]").forEach((n) => (n.textContent = String(m).padStart(2, "0")));
      el.querySelectorAll("[data-cd-s]").forEach((n) => (n.textContent = String(s).padStart(2, "0")));
    }
    tick();
    setInterval(tick, 1000);
  });

  // Stat number count up
  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.getAttribute("data-target") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        const dur = 1200;
        const start = performance.now();
        function step(t) {
          const p = Math.min(1, (t - start) / dur);
          const v = Math.floor(target * (0.2 + 0.8 * p));
          el.textContent = `${target % 1 === 0 ? Math.floor(target * p) : (target * p).toFixed(1)}${suffix}`;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = `${target}${suffix}`;
        }
        requestAnimationFrame(step);
        statIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll("[data-target]").forEach((el) => statIO.observe(el));
})();
