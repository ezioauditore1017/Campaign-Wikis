import fs from "fs";
import path from "path";

const docsDir = path.join("docs");
const sidebarFile = path.join(docsDir, "_sidebar.md");

// Option: keep subfolder index.md files in sidebar? (true = include)
const keepIndexFiles = false;

// Recursive function to walk folders and build sidebar
function walkDir(dir, level = 0) {
    let result = "";
    const indent = "  ".repeat(level); // two spaces per level
    const items = fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relPath = path.relative(docsDir, fullPath).replace(/\\/g, "/");

        if (item.isDirectory()) {
            result += `${indent}- ${item.name}\n`; // folder as collapsible category
            result += walkDir(fullPath, level + 1);  // recurse into folder
        } else if (item.isFile() && item.name.endsWith(".md")) {
            const name = item.name.replace(".md", "");
            if (name.toLowerCase() !== "index" || keepIndexFiles) {
                result += `${indent}  - [${name}](${relPath})\n`;
            }
        }
    }

    return result;
}

// Build sidebar
let sidebar = "- [Home](index.html)\n\n";
sidebar += walkDir(docsDir);

// Write to _sidebar.md
fs.writeFileSync(sidebarFile, sidebar);
console.log("✅ _sidebar.md generated with fully nested collapsible categories.");
