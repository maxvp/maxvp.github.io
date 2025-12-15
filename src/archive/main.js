import entries from "../generated/archive.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatYearMonth(dateStr) {
  const raw = String(dateStr || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return raw;

  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!year || month < 1 || month > 12) return raw;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${monthNames[month - 1]} ${year}`;
}

function renderEntry(entry) {
  const title = entry.title ? escapeHtml(entry.title) : "";
  const url = entry.url ? String(entry.url) : "";
  const displayDate = entry.date ? escapeHtml(formatYearMonth(entry.date)) : "";
  const client = entry.client ? escapeHtml(entry.client) : "";
  const clientUrl = entry.clientUrl ? String(entry.clientUrl) : "";
  const clientClass = entry.clientClass ? escapeHtml(entry.clientClass) : "";
  const image = entry.image ? String(entry.image) : "";
  const imageAlt = entry.imageAlt ? escapeHtml(entry.imageAlt) : "";
  const descriptionHtml = entry.descriptionHtml
    ? String(entry.descriptionHtml)
    : "";

  const titleHtml = url ? `<a href="${escapeHtml(url)}">${title}</a>` : title;

  const clientHtml = clientUrl
    ? `<a href="${escapeHtml(clientUrl)}"${
        clientClass ? ` class="${clientClass}"` : ""
      }>${client}</a>`
    : client;

  const imageHtml = image
    ? `<div class="content"><a href="${escapeHtml(
        url || image
      )}"><img src="${escapeHtml(image)}" alt="${imageAlt}" /></a></div>`
    : "";

  return `
    <div class="portfolio-item">
      ${displayDate ? `<p class="date">${displayDate}</p>` : ""}
      ${title ? `<h3 class="title">${titleHtml}</h3>` : ""}
      ${client ? `<p class="client">${clientHtml}</p>` : ""}
      ${imageHtml}
      ${
        descriptionHtml
          ? `<div class="description">${descriptionHtml}</div>`
          : ""
      }
    </div>
  `;
}

const mount = document.getElementById("portfolio-app");
if (mount) {
  mount.innerHTML = entries.map(renderEntry).join("\n");
}
