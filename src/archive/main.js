import entries from "../generated/archive.json";

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
    ? `<span class="archive-client">${client}</span>`
    : "";

  const titleHtml = url
    ? `<a class="archive-title" href="${escapeHtml(url)}">${title}</a>`
    : `<span class="archive-title">${title}</span>`;

  const thumbHtml = image
    ? `<a class="archive-thumb" href="${escapeHtml(
      url || image
    )}"><img src="${escapeHtml(
      image
    )}" alt="${imageAlt}" loading="lazy" decoding="async" /></a>`
    : "";

  return `
    <div class="portfolio-item">
      ${dateLabel ? `<div class="archive-date-row"><span class="archive-year">${dateLabel}</span></div>` : ""}
      <div class="archive-main-row">
        <span class="archive-main">${titleHtml}</span>
        ${thumbHtml}
      </div>
      ${descriptionHtml
      ? `<div class="archive-desc">${clientHtml ? `<div class="archive-meta">${clientHtml}</div>` : ""
      }${descriptionHtml}</div>`
      : ""
    }
    </div>
  `;
}

function initArchiveTooltips(root) {
  if (!root) return;

  const canHover = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
    : false;
  if (!canHover) return;

  document.documentElement.classList.add("has-archive-tooltip");

  const tooltip = document.createElement("div");
  tooltip.className = "archive-tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  let activeItem = null;

  function showForItem(item) {
    const desc = item ? item.querySelector(".archive-desc") : null;
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
    const desc = item.querySelector(".archive-desc");
    const title = item.querySelector(".archive-title");
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

const mount = document.getElementById("portfolio-app");
if (mount) {
  const THRESHOLD_YEAR = 2023;
  let dividerInserted = false;
  const htmlParts = [];

  for (const entry of entries) {
    htmlParts.push(renderEntry(entry));
  }

  mount.innerHTML = htmlParts.join("\n");
  // initArchiveTooltips(mount);
}
