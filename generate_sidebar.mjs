// generate_sidebar.mjs
import { promises as fs } from "fs";
import path from "path";

const DOCS = path.resolve("."); // Current folder
const IGNORED_FILES = new Set(["index.html", "_sidebar.md", ".nojekyll"]);
const MD_EXT = new Set([".md", ".markdown", ".txt"]); // Include .txt

// Convert Obsidian [[wikilinks]] to Markdown links
function convertWikilinks(label) {
  return label.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
    const file = encodeURIComponent(target.trim() + ".md");
    const text = display ? display.trim() : target.trim();
    return `[${text}](${file})`;
  });
}

function titleFromFilename(file) {
  const base = file.replace(/\.(md|markdown|txt)$/i, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

async function getTitleFromFrontmatter(absPath) {
  try {
    const data = await fs.readFile(absPath, "utf8");
    const m = data.match(/^---\s*[\s\S]*?\btitle:\s*["']?(.+?)["']?\s*[\s\S]*?---/i);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

async function listDir(dirRel = "") {
  const dirAbs = path.join(DOCS, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });

  const dirs = [];
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    if (IGNORED_FILES.has(e.name)) continue;
    if (e.isDirectory()) dirs.push(e.name);
    else if (MD_EXT.has(path.extname(e.name).toLowerCase())) files.push(e.name);
  }

  dirs.sort((a, b) => a.localeCompare(b));
  files.sort((a, b) => a.localeCompare(b));
  return { dirs, files, dirRel };
}

async function* walk(dirRel = "", depth = 0) {
  const { dirs, files } = await listDir(dirRel);

  // Check for folder README.md (landing page)
  const readmeIndex = files.findIndex(f => /^readme\.(md|markdown)$/i.test(f));
  let readme = null;
  if (readmeIndex !== -1) {
    readme = files.splice(readmeIndex, 1)[0];
  }

  if (dirRel) {
    const folderTitle = titleFromFilename(path.basename(dirRel));
    if (readme) {
      const rel = path.posix.join("/", dirRel.split(path.sep).join("/"), readme);
      const fmTitle = await getTitleFromFrontmatter(path.join(DOCS, dirRel, readme));
      const labelRaw = fmTitle || folderTitle;
      const label = convertWikilinks(labelRaw);
      yield { depth: depth - 1, label, link: encodeURI(rel) };
    } else {
      yield { depth: depth - 1, label: folderTitle, link: null };
    }
  }

  // Files
  for (const f of files) {
    const rel = path.posix.join("/", dirRel.split(path.sep).join("/"), f);
    const fmTitle = await getTitleFromFrontmatter(path.join(DOCS, dirRel, f));
    const rawLabel = fmTitle || titleFromFilename(f);
    const label = convertWikilinks(rawLabel);
    yield { depth, label, link: encodeURI(rel) };
  }

  // Subfolders
  for (const d of dirs) {
    for await (const child of walk(path.join(dirRel, d), depth + 1)) {
      yield child;
    }
  }
}

async function buildSidebar() {
  let out = "";

  // Root README.md = Home
  try {
    await fs.access(path.join(DOCS, "README.md"));
    out += `- [Home](/README.md)\n`;
  } catch {}

  for await (const item of walk("", 1)) {
    const indent = "  ".repeat(item.depth);
    if (item.link) out += `${indent}- [${item.label}](${item.link})\n`;
    else out += `${indent}- ${item.label}\n`;
  }

  const sidebarPath = path.join(DOCS, "_sidebar.md");
  await fs.writeFile(sidebarPath, out.trim() + "\n", "utf8");
  console.log(`✅ Wrote ${path.relative(process.cwd(), sidebarPath)}`);
}

buildSidebar().catch((e) => {
  console.error(e);
  process.exit(1);
});
