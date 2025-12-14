import { promises as fs } from "fs";
import path from "path";

const contentDir = path.resolve("content/archive");
const outFile = path.resolve("src/generated/archive.json");

function parseFrontmatter(source) {
  const trimmed = source.replace(/^\uFEFF/, "");
  if (!trimmed.startsWith("---\n")) {
    return { data: {}, body: trimmed };
  }

  const end = trimmed.indexOf("\n---\n", 4);
  if (end === -1) {
    return { data: {}, body: trimmed };
  }

  const fmRaw = trimmed.slice(4, end);
  const body = trimmed.slice(end + "\n---\n".length);

  const data = {};
  for (const line of fmRaw.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const idx = trimmedLine.indexOf(":");
    if (idx === -1) continue;

    const key = trimmedLine.slice(0, idx).trim();
    let value = trimmedLine.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [];
      continue;
    }

    data[key] = value;
  }

  return { data, body };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markdownToHtml(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const paragraphs = normalized.split(/\n\s*\n/g);

  return paragraphs
    .map((p) => {
      let html = escapeHtml(p);

      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_m, text, href) =>
          `<a href=\"${escapeHtml(href)}\">${escapeHtml(text)}<\/a>`
      );

      html = html.replace(/\n/g, "<br />\n");
      return `<p>${html}</p>`;
    })
    .join("\n");
}

async function main() {
  const entries = [];

  let files = [];
  try {
    files = await fs.readdir(contentDir);
  } catch {
    files = [];
  }

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const fullPath = path.join(contentDir, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, body } = parseFrontmatter(raw);

    const slug = file.replace(/\.md$/, "");

    entries.push({
      slug,
      title: data.title || slug,
      date: data.date || "",
      client: data.client || "",
      clientUrl: data.clientUrl || "",
      url: data.url || "",
      image: data.image || "",
      imageAlt: data.imageAlt || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      descriptionHtml: markdownToHtml(body),
    });
  }

  entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

await main();
