/* =====================================================
   DCI Consultants — Employee Portal
   Shared behaviour: nav toggle, theme toggle, scroll
   animations, and dynamic rendering for Templates,
   Policies and Guides pages (data comes from data.js).
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initThemeToggle();
  initScrollAnimations();
  initTemplatesPage();
  initPoliciesPage();
  initGuidesPage();
});

/* ---------- Mobile hamburger nav ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".hamburger");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Dark mode toggle ---------- */
function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  const stored = localStorage.getItem("dci-theme");
  const theme = stored || "light";
  applyTheme(theme);

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("dci-theme", next); } catch (e) { /* storage unavailable */ }
  });
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ---------- Fade-up on scroll ---------- */
function initScrollAnimations() {
  const items = document.querySelectorAll(".fade-up");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Image fallback helper ----------
   Call via onerror="handleImgError(this)" in markup.
   Replaces a broken remote image with a gradient block
   so the layout never shows a broken-image icon. */
function handleImgError(img) {
  img.onerror = null;
  img.style.display = "none";
  const fallback = document.createElement("div");
  fallback.style.width = "100%";
  fallback.style.height = "100%";
  fallback.style.background = "linear-gradient(135deg, var(--color-primary), var(--color-accent))";
  img.parentElement.appendChild(fallback);
}

/* ---------- Templates page ---------- */
function initTemplatesPage() {
  const grid = document.getElementById("template-grid");
  if (!grid || typeof TEMPLATES === "undefined") return;

  const searchInput = document.getElementById("template-search");
  const chipsWrap = document.getElementById("template-filters");
  const resultCount = document.getElementById("template-result-count");
  const emptyState = document.getElementById("template-empty");

  const categories = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
  let activeCategory = "All";

  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = cat;
    chip.setAttribute("aria-pressed", cat === "All" ? "true" : "false");
    chip.addEventListener("click", () => {
      activeCategory = cat;
      chipsWrap.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      render();
    });
    chipsWrap.appendChild(chip);
  });

  function render() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const filtered = TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    grid.innerHTML = "";
    filtered.forEach((t) => grid.appendChild(renderTemplateCard(t)));

    resultCount.textContent = `${filtered.length} template${filtered.length === 1 ? "" : "s"} found`;
    emptyState.classList.toggle("visible", filtered.length === 0);
  }

  function renderTemplateCard(t) {
    const card = document.createElement("article");
    card.className = "template-card fade-up in-view";
    card.innerHTML = `
      <div class="template-top">
        <div class="template-icon" aria-hidden="true">${t.icon}</div>
        <span class="badge">${t.fileType}</span>
      </div>
      <p class="category-tag">${t.category}</p>
      <h3>${t.title}</h3>
      <p>${t.description}</p>
      <a class="btn btn-primary btn-sm" href="${t.file}" download>⬇ Download</a>
    `;
    return card;
  }

  searchInput.addEventListener("input", render);
  render();
}

/* ---------- Policies page ---------- */
function initPoliciesPage() {
  const list = document.getElementById("policy-list");
  if (!list || typeof POLICIES === "undefined") return;

  const searchInput = document.getElementById("policy-search");
  const resultCount = document.getElementById("policy-result-count");
  const emptyState = document.getElementById("policy-empty");

  function render() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const filtered = POLICIES.filter((p) => {
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query)
      );
    });

    list.innerHTML = "";
    filtered.forEach((p) => list.appendChild(renderPolicyItem(p)));

    resultCount.textContent = `${filtered.length} polic${filtered.length === 1 ? "y" : "ies"} found`;
    emptyState.classList.toggle("visible", filtered.length === 0);
  }

  function renderPolicyItem(p) {
    const item = document.createElement("div");
    item.className = "accordion-item fade-up in-view";

    const triggerId = `policy-trigger-${p.id}`;
    const panelId = `policy-panel-${p.id}`;

    item.innerHTML = `
      <button class="accordion-trigger" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}">
        <span>
          <h3>${p.title}</h3>
          <span class="accordion-meta">${p.category} · Last updated ${formatDate(p.updated)}</span>
        </span>
        <span class="accordion-icon" aria-hidden="true">+</span>
      </button>
      <div class="accordion-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}">
        <ul>${p.body.map((line) => `<li>${line}</li>`).join("")}</ul>
      </div>
    `;

    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      if (isOpen) {
        panel.style.maxHeight = null;
        panel.classList.remove("open");
      } else {
        panel.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });

    return item;
  }

  searchInput.addEventListener("input", render);
  render();
}

function formatDate(iso) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return iso;
  }
}

/* ---------- Guides page (steps + FAQ) ---------- */
function initGuidesPage() {
  const list = document.getElementById("guide-list");
  if (!list || typeof GUIDES === "undefined") return;

  GUIDES.forEach((g, index) => {
    const card = document.createElement("article");
    card.className = "guide-card fade-up in-view";
    card.innerHTML = `
      <h3><span class="guide-num">${index + 1}</span> ${g.title}</h3>
      <ol class="step-list">
        ${g.steps
          .map(
            (step, i) => `
          <li>
            <span class="step-num">${i + 1}</span>
            <span class="step-text">${step}</span>
          </li>`
          )
          .join("")}
      </ol>
      ${g.tip ? `<div class="tip-callout"><span aria-hidden="true">💡</span><p><strong>Tip:</strong> ${g.tip}</p></div>` : ""}
    `;
    list.appendChild(card);
  });

  const faqList = document.getElementById("faq-list");
  if (faqList && typeof FAQS !== "undefined") {
    FAQS.forEach((faq, index) => {
      const item = document.createElement("div");
      item.className = "accordion-item fade-up in-view";
      const triggerId = `faq-trigger-${index}`;
      const panelId = `faq-panel-${index}`;
      item.innerHTML = `
        <button class="accordion-trigger" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}">
          <h3>${faq.q}</h3>
          <span class="accordion-icon" aria-hidden="true">+</span>
        </button>
        <div class="accordion-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}">
          <p>${faq.a}</p>
        </div>
      `;
      const trigger = item.querySelector(".accordion-trigger");
      const panel = item.querySelector(".accordion-panel");
      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        if (isOpen) {
          panel.style.maxHeight = null;
          panel.classList.remove("open");
        } else {
          panel.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
      faqList.appendChild(item);
    });
  }
}
