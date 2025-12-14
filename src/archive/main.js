import entries from "../generated/archive.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEntry(entry) {
  const title = entry.title ? escapeHtml(entry.title) : "";
  const url = entry.url ? String(entry.url) : "";
  const date = entry.date ? escapeHtml(entry.date) : "";
  const client = entry.client ? escapeHtml(entry.client) : "";
  const clientUrl = entry.clientUrl ? String(entry.clientUrl) : "";
  const image = entry.image ? String(entry.image) : "";
  const imageAlt = entry.imageAlt ? escapeHtml(entry.imageAlt) : "";
  const descriptionHtml = entry.descriptionHtml
    ? String(entry.descriptionHtml)
    : "";

  const titleHtml = url ? `<a href="${escapeHtml(url)}">${title}</a>` : title;

  const clientHtml = clientUrl
    ? `<a href="${escapeHtml(clientUrl)}">${client}</a>`
    : client;

  const imageHtml = image
    ? `<div class="content"><a href="${escapeHtml(
        url || image
      )}"><img src="${escapeHtml(image)}" alt="${imageAlt}" /></a></div>`
    : "";

  return `
    <div class="portfolio-item">
      ${date ? `<p class="date">${date}</p>` : ""}
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
