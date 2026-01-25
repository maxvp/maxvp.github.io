import meta from "./generated/site-meta.json";
import sitemap from "./generated/sitemap.json";
import "./status-bar.css";

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
  left.innerHTML = "";
  const container = document.createElement("div");
  container.className = "sitemap-container";

  const trigger = document.createElement("div");
  trigger.className = "sitemap-trigger";
  trigger.textContent = "Index";

  const content = document.createElement("div");
  content.className = "sitemap-content";

  function renderTree(items, parent) {
    const ul = document.createElement("ul");
    ul.className = "sitemap-list";
    for (const item of items) {
      const li = document.createElement("li");
      li.className = `sitemap-item sitemap-${item.type}`;

      if (item.type === "file") {
        const a = document.createElement("a");
        a.href = item.path;
        a.textContent = item.name;
        li.appendChild(a);
      } else {
        const span = document.createElement("span");
        span.className = "sitemap-dir-name";
        span.textContent = item.name + "/";
        li.appendChild(span);

        if (item.children && item.children.length) {
          renderTree(item.children, li);
        }
      }
      ul.appendChild(li);
    }
    parent.appendChild(ul);
  }

  renderTree(sitemap, content);
  container.appendChild(trigger);
  container.appendChild(content);
  left.appendChild(container);

  let timeoutId;
  const showMenu = () => {
    clearTimeout(timeoutId);
    container.classList.add("is-active");
  };
  const hideMenu = () => {
    timeoutId = setTimeout(() => {
      container.classList.remove("is-active");
    }, 150); // Small grace period to move mouse
  };

  trigger.addEventListener("mouseenter", showMenu);
  trigger.addEventListener("mouseleave", hideMenu);
  content.addEventListener("mouseenter", showMenu);
  content.addEventListener("mouseleave", hideMenu);
}

if (right) {
  const formatted = formatDate(meta?.commitDateIso);
  right.textContent = "";
  if (formatted) {
    right.appendChild(document.createTextNode("Last updated "));

    const a = document.createElement("a");
    a.href = "https://github.com/maxvp/maxvp.github.io";
    a.textContent = formatted;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    right.appendChild(a);
  }
}
