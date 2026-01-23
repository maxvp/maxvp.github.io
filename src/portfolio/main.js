import entries from "../generated/portfolio.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMonthYear(dateStr) {
  const raw = String(dateStr || "").trim();
  const m = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!m) return raw;

  const year = m[1];
  const monthStr = m[2];
  if (!monthStr) return year;
  const month = Number(monthStr);
  if (month < 1 || month > 12) return year;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthNames[month - 1]} ${year}`;
}

function extractYear(dateStr) {
  const raw = String(dateStr || "").trim();
  const m = raw.match(/^(\d{4})/);
  if (!m) return null;
  return Number(m[1]);
}

function renderEntry(entry) {
  const title = entry.title ? escapeHtml(entry.title) : "";
  const url = entry.url ? String(entry.url) : "";
  const dateLabel = entry.date ? escapeHtml(formatMonthYear(entry.date)) : "";
  const client = entry.client ? escapeHtml(entry.client) : "";
  const image = entry.image ? String(entry.image) : "";
  const imageAlt = entry.imageAlt ? escapeHtml(entry.imageAlt) : "";
  const descriptionHtml = entry.descriptionHtml
    ? String(entry.descriptionHtml)
    : "";

  const clientHtml = client
    ? `<span class="portfolio-client">${client}</span>`
    : "";

  const featuredHtml = entry.featured
    ? `<span class="portfolio-featured" aria-hidden="true">★ </span>`
    : "";

  const titleHtml = url
    ? `<a class="portfolio-title" href="${escapeHtml(url)}">${featuredHtml}${title}</a>`
    : `<span class="portfolio-title">${featuredHtml}${title}</span>`;

  const thumbHtml = image
    ? `<a class="portfolio-thumb" href="${escapeHtml(
        url || image,
      )}"><img src="${escapeHtml(
        image,
      )}" alt="${imageAlt}" loading="lazy" decoding="async" /></a>`
    : "";

  return `
    <div class="portfolio-item">
      ${dateLabel ? `<div class="portfolio-date-row"><span class="portfolio-year">${dateLabel}</span></div>` : ""}
      <div class="portfolio-main-row">
        <div class="portfolio-main">
          ${titleHtml}
          ${clientHtml ? `<div class="portfolio-client-subtitle">${clientHtml}</div>` : ""}
        </div>
        ${thumbHtml}
      </div>
      ${
        descriptionHtml
          ? `<div class="portfolio-desc">${descriptionHtml}</div>`
          : ""
      }
    </div>
  `;
}

function initPortfolioTooltips(root) {
  if (!root) return;

  const canHover = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
    : false;
  if (!canHover) return;

  document.documentElement.classList.add("has-portfolio-tooltip");

  const tooltip = document.createElement("div");
  tooltip.className = "portfolio-tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  let activeItem = null;

  function showForItem(item) {
    const desc = item ? item.querySelector(".portfolio-desc") : null;
    if (!desc) return;
    tooltip.innerHTML = desc.innerHTML;
    tooltip.style.display = "block";
    activeItem = item;
  }

  function hide() {
    tooltip.style.display = "none";
    activeItem = null;
  }

  function positionAt(x, y) {
    const pad = 12;
    const maxW = tooltip.offsetWidth || 0;
    const maxH = tooltip.offsetHeight || 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + pad;
    let top = y + pad;
    if (left + maxW + pad > vw) left = Math.max(pad, x - maxW - pad);
    if (top + maxH + pad > vh) top = Math.max(pad, y - maxH - pad);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  for (const item of root.querySelectorAll(".portfolio-item")) {
    const desc = item.querySelector(".portfolio-desc");
    const title = item.querySelector(".portfolio-title");
    if (!desc || !title) continue;

    title.addEventListener("pointerenter", (e) => {
      showForItem(item);
      positionAt(e.clientX, e.clientY);
    });
    title.addEventListener("pointermove", (e) => {
      if (activeItem !== item) return;
      positionAt(e.clientX, e.clientY);
    });
    title.addEventListener("pointerleave", () => {
      if (activeItem === item) hide();
    });

    title.addEventListener("focus", () => {
      showForItem(item);
      const r = title.getBoundingClientRect();
      positionAt(r.left, r.bottom);
    });
    title.addEventListener("blur", () => {
      if (activeItem === item) hide();
    });
  }
}

function renderPortfolio(showAll) {
  const mount = document.getElementById("portfolio-app");
  if (!mount) return;

  const htmlParts = [];

  for (const entry of entries) {
    if (!showAll && !entry.featured) continue;
    htmlParts.push(renderEntry(entry));
  }

  mount.innerHTML = htmlParts.join("\n");
}

const btnFeatured = document.getElementById("toggle-featured");
const btnAll = document.getElementById("toggle-all");

if (btnFeatured && btnAll) {
  btnFeatured.addEventListener("click", () => {
    btnFeatured.classList.add("active");
    btnFeatured.setAttribute("aria-pressed", "true");
    btnAll.classList.remove("active");
    btnAll.setAttribute("aria-pressed", "false");
    renderPortfolio(false);
  });

  btnAll.addEventListener("click", () => {
    btnAll.classList.add("active");
    btnAll.setAttribute("aria-pressed", "true");
    btnFeatured.classList.remove("active");
    btnFeatured.setAttribute("aria-pressed", "false");
    renderPortfolio(true);
  });

  // Initial render: show featured by default
  renderPortfolio(false);
}
