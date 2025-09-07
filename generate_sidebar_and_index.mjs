import fs from "fs";
import path from "path";

// Base docs folder
const docsFolder = path.join(".", "docs");

// Utility: replace spaces with hyphens in names
function sanitizeName(name) {
  return name.replace(/\s+/g, "-");
}

// Rename folder or file if it contains spaces
function renameIfNeeded(fullPath) {
  const dir = path.dirname(fullPath);
  const name = path.basename(fullPath);
  const sanitized = sanitizeName(name);
  const newPath = path.join(dir, sanitized);

  if (newPath !== fullPath) {
    fs.renameSync(fullPath, newPath);
    console.log(`✅ Renamed '${name}' to '${sanitized}'`);
  }

  return newPath;
}

// Generate index.md if it doesn’t exist
function generateIndex(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `# ${path.basename(path.dirname(filePath))}\n\n`, "utf-8");
    console.log(`✅ index.md generated for ${path.dirname(filePath)}`);
  }
}

// Recursive function to walk folders
function walkDir(dir, depth = 0) {
  let items = fs.readdirSync(dir, { withFileTypes: true });
  let sidebar = "";

  for (let item of items) {
    if (item.name.startsWith(".")) continue; // Skip hidden files

    let fullPath = path.join(dir, item.name);
    fullPath = renameIfNeeded(fullPath); // rename if needed

    const relPath = path.relative(docsFolder, fullPath).replace(/\\/g, "/");

    if (item.isDirectory()) {
      // Generate index.md for folder
      generateIndex(path.join(fullPath, "index.md"));

      // Add folder to sidebar
      sidebar += `${"  ".repeat(depth)}- [${path.basename(fullPath)}](${relPath}/index.md)\n`;

      // Recurse into folder
      sidebar += walkDir(fullPath, depth + 1);
    } else if (item.isFile() && item.name !== "index.md" && item.name !== "_sidebar.md") {
      // Add file to sidebar
      sidebar += `${"  ".repeat(depth + 1)}- [${path.basename(item.name, ".md")}](${relPath})\n`;
    }
  }

  return sidebar;
}

// Build the sidebar
const sidebarContent = "- [Home](index.html)\n" + walkDir(docsFolder);

// Write _sidebar.md
fs.writeFileSync(path.join(docsFolder, "_sidebar.md"), sidebarContent, "utf-8");
console.log("✅ _sidebar.md generated successfully!");
