import meta from "./generated/site-meta.json";

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value || "");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return String(value || "");
  }
}

const left = document.getElementById("status-copyright");
const right = document.getElementById("status-updated");

if (left) {
  const year = new Date().getFullYear();
  left.textContent = `© ${year}`;
}

if (right) {
  const formatted = formatDate(meta?.commitDateIso);
  right.textContent = formatted ? `Last updated: ${formatted}` : "";
}
