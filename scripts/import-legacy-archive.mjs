import { promises as fs } from "fs";
import path from "path";

const legacyFile = path.resolve("public/archive/legacy.html");
const outDir = path.resolve("content/archive");

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

    data[key] = value;
  }

  return { data, body };
}

function decodeHtmlEntities(input) {
  return String(input)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&shy;", "");
}

function stripTags(input) {
  return decodeHtmlEntities(String(input).replace(/<[^>]+>/g, ""));
}

function normalizeWhitespace(input) {
  return String(input).replace(/\s+/g, " ").trim();
}

function htmlLinksToMarkdown(input) {
  return String(input).replace(
    /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, text) => {
      const label = normalizeWhitespace(stripTags(text));
      const url = decodeHtmlEntities(href);
      return `[${label}](${url})`;
    }
  );
}

function htmlToMarkdownText(input) {
  const withLinks = htmlLinksToMarkdown(input);
  const withoutTags = withLinks.replace(/<[^>]+>/g, "");
  return normalizeWhitespace(decodeHtmlEntities(withoutTags));
}

function slugify(input) {
  const s = normalizeWhitespace(stripTags(input)).toLowerCase();
  const cleaned = s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 80);
  return cleaned || "entry";
}

function extractFirstMatch(re, text) {
  const m = re.exec(text);
  return m ? m.slice(1) : null;
}

function findArchiveItemBlocks(html) {
  const blocks = [];
  const marker = '<div class="archive-item">';
  let i = 0;

  while (true) {
    const start = html.indexOf(marker, i);
    if (start === -1) break;

    const divRe = /<\/?div\b/gi;
    divRe.lastIndex = start;

    let depth = 0;
    let end = -1;

    while (true) {
      const m = divRe.exec(html);
      if (!m) break;

      const token = m[0].toLowerCase();
      if (token === "<div") depth += 1;
      else depth -= 1;

      if (depth === 0) {
        const close = html.indexOf(">", m.index);
        end = close === -1 ? -1 : close + 1;
        break;
      }
    }

    if (end === -1) break;

    blocks.push(html.slice(start, end));
    i = end;
  }

  return blocks;
}

async function nextAvailableFilename(baseName) {
  const fullPath = path.join(outDir, baseName + ".md");
  try {
    await fs.access(fullPath);
    return null;
  } catch {
    return fullPath;
  }
}

async function main() {
  const html = await fs.readFile(legacyFile, "utf8");
  const blocks = findArchiveItemBlocks(html);

  await fs.mkdir(outDir, { recursive: true });

  const existingKeys = new Set();
  try {
    const existingFiles = await fs.readdir(outDir);
    for (const file of existingFiles) {
      if (!file.endsWith(".md")) continue;
      const fullPath = path.join(outDir, file);
      const raw = await fs.readFile(fullPath, "utf8");
      const { data } = parseFrontmatter(raw);

      const date = data.date ? String(data.date).trim() : "";
      const title = data.title ? String(data.title).trim() : "";
      if (date && title) {
        existingKeys.add(`${date}|${title}`);
      }
    }
  } catch {
    // ignore
  }

  let created = 0;
  for (const block of blocks) {
    const dateMatch = extractFirstMatch(
      /<p\s+class="date"[^>]*real-date="([^"]+)"[^>]*>([\s\S]*?)<\/p>/i,
      block
    );
    if (!dateMatch) continue;

    const [realDate] = dateMatch;

    const titleMatch = extractFirstMatch(
      /<h3\s+class="title">[\s\S]*?<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i,
      block
    );

    const url = titleMatch ? decodeHtmlEntities(titleMatch[0]) : "";
    const titleRaw = titleMatch ? titleMatch[1] : "";
    const title = normalizeWhitespace(stripTags(titleRaw));

    if (realDate && title && existingKeys.has(`${realDate}|${title}`)) {
      continue;
    }

    const clientMatch = extractFirstMatch(
      /<p\s+class="client">[\s\S]*?<a\s+[^>]*href="([^"]+)"[^>]*?(?:class="([^"]+)")?[^>]*>([\s\S]*?)<\/a>/i,
      block
    );

    const clientUrl = clientMatch ? decodeHtmlEntities(clientMatch[0]) : "";
    const clientClass = clientMatch ? clientMatch[1] || "" : "";
    const client = clientMatch
      ? normalizeWhitespace(stripTags(clientMatch[2]))
      : "";

    const descMatch = extractFirstMatch(
      /<p\s+class="description">([\s\S]*?)<\/p>/i,
      block
    );
    const description = descMatch ? htmlToMarkdownText(descMatch[0]) : "";

    const imgMatch = extractFirstMatch(
      /<img\s+[^>]*src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>/i,
      block
    );

    let image = "";
    let imageAlt = "";

    if (imgMatch) {
      const [src, alt] = imgMatch;
      imageAlt = alt ? normalizeWhitespace(decodeHtmlEntities(alt)) : "";

      if (src.startsWith("http") || src.startsWith("/")) {
        image = src;
      } else {
        image = `/archive/${src.replace(/^\.\/?/, "")}`;
      }
    }

    const creditMatch = extractFirstMatch(
      /<ul\s+class="credit">([\s\S]*?)<\/ul>/i,
      block
    );

    const creditLines = [];
    if (creditMatch) {
      const liRe = /<li>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = liRe.exec(creditMatch[0]))) {
        const line = htmlToMarkdownText(m[1]);
        if (line) creditLines.push(`- ${line}`);
      }
    }

    const slug = slugify(title);
    const baseName = `${realDate}-${slug}`;
    const outPath = await nextAvailableFilename(baseName);
    if (!outPath) {
      continue;
    }

    const fm = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `date: ${realDate}`,
      client ? `client: ${JSON.stringify(client)}` : 'client: ""',
      clientUrl ? `clientUrl: ${clientUrl}` : 'clientUrl: ""',
      clientClass
        ? `clientClass: ${JSON.stringify(clientClass)}`
        : 'clientClass: ""',
      url ? `url: ${url}` : 'url: ""',
      image ? `image: ${image}` : 'image: ""',
      imageAlt ? `imageAlt: ${JSON.stringify(imageAlt)}` : 'imageAlt: ""',
      "---",
      "",
    ].join("\n");

    const bodyParts = [];
    if (description) bodyParts.push(description);
    if (creditLines.length) {
      bodyParts.push("");
      bodyParts.push(...creditLines);
    }

    const body = bodyParts.join("\n").trimEnd() + "\n";

    await fs.writeFile(outPath, fm + body, "utf8");
    created += 1;
  }

  console.log(`Imported ${created} entries to ${outDir}`);
}

await main();
