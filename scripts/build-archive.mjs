import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";

const contentDir = path.resolve("content/archive");
const outFile = path.resolve("src/generated/archive.json");
const siteMetaFile = path.resolve("src/generated/site-meta.json");

async function collectMarkdownFiles(dir) {
  const results = [];

  async function walk(currentDir) {
    let dirents = [];
    try {
      dirents = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const dirent of dirents) {
      const fullPath = path.join(currentDir, dirent.name);
      if (dirent.isDirectory()) {
        await walk(fullPath);
      } else if (dirent.isFile() && dirent.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  await walk(dir);
  return results;
}

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

function normalizeUrl(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";

  try {
    const u = new URL(value);
    const parts = u.hostname.split(".");
    if (parts.length > 3 && parts[0].toLowerCase() === "www") {
      u.hostname = parts.slice(1).join(".");
      return u.toString();
    }
  } catch {
    return value;
  }

  return value;
}

function inlineTextToHtml(text) {
  let html = escapeHtml(text);

  html = html.replace(
    /(^|[^\w])\*\*([^*]+?)\*\*([^\w]|$)/g,
    "$1<strong>$2</strong>$3"
  );
  html = html.replace(
    /(^|[^\w])__([^_]+?)__([^\w]|$)/g,
    "$1<strong>$2</strong>$3"
  );
  html = html.replace(/(^|[^\w])\*([^*]+?)\*([^\w]|$)/g, "$1<em>$2</em>$3");
  html = html.replace(/(^|[^\w])_([^_]+?)_([^\w]|$)/g, "$1<em>$2</em>$3");

  return html;
}

function inlineMarkdownToHtml(text) {
  const raw = String(text ?? "");
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  for (const m of raw.matchAll(linkRe)) {
    const index = m.index ?? 0;
    parts.push(inlineTextToHtml(raw.slice(lastIndex, index)));

    const label = m[1] ?? "";
    const href = m[2] ?? "";
    parts.push(`<a href="${escapeHtml(href)}">${inlineTextToHtml(label)}<\/a>`);

    lastIndex = index + m[0].length;
  }
  parts.push(inlineTextToHtml(raw.slice(lastIndex)));

  return parts.join("");
}

function markdownToHtml(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const blocks = normalized.split(/\n\s*\n/g);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const isList = lines.every((l) => l.trim().startsWith("- "));

      if (isList) {
        const items = lines
          .map((l) => l.trim().slice(2))
          .map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`)
          .join("\n");
        return `<ul>\n${items}\n</ul>`;
      }

      const html = inlineMarkdownToHtml(block).replace(/\n/g, "<br />\n");
      return `<p>${html}</p>`;
    })
    .join("\n");
}

async function main() {
  const entries = [];

  const files = await collectMarkdownFiles(contentDir);

  for (const fullPath of files) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, body } = parseFrontmatter(raw);

    const client = data.client || "";
    const clientClass = data.clientClass || "";
    const effectiveClientClass =
      clientClass || (client && client !== "Cloudflare" ? "student" : "");

    const relPath = path
      .relative(contentDir, fullPath)
      .split(path.sep)
      .join("/");
    const slug = relPath.replace(/\.md$/, "");

    entries.push({
      slug,
      title: data.title || slug,
      date: data.date || "",
      client,
      clientUrl: normalizeUrl(data.clientUrl || ""),
      clientClass: effectiveClientClass,
      url: normalizeUrl(data.url || ""),
      featured: data.featured === "true",
      image: data.image || "",
      imageAlt: data.imageAlt || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      descriptionHtml: markdownToHtml(body),
    });
  }

  entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(entries, null, 2) + "\n", "utf8");

  let commitHash =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "";
  let commitDateIso =
    process.env.CF_PAGES_COMMIT_TIMESTAMP ||
    process.env.VERCEL_GIT_COMMIT_DATE ||
    "";

  if (!commitHash || !commitDateIso) {
    try {
      const raw = execSync("git log -1 --format=%H|%cI", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      const [h, d] = raw.split("|");
      if (!commitHash && h) commitHash = h;
      if (!commitDateIso && d) commitDateIso = d;
    } catch {
      // ignore
    }
  }

  if (!commitDateIso) commitDateIso = new Date().toISOString();

  await fs.mkdir(path.dirname(siteMetaFile), { recursive: true });
  await fs.writeFile(
    siteMetaFile,
    JSON.stringify(
      {
        commitHash,
        commitDateIso,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
}

await main();
