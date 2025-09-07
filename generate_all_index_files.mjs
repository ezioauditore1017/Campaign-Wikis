import fs from 'fs';
import path from 'path';

const docsDir = path.join('.', 'docs'); // root docs folder

function generateIndex(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  // Filter Markdown files excluding index.md
  const mdFiles = items.filter(f => f.isFile() && f.name.endsWith('.md') && f.name.toLowerCase() !== 'index.md');

  // Generate index.md if it doesn't exist
  const indexPath = path.join(dir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    const folderName = path.basename(dir);
    let content = `# ${folderName}\n\n`;

    if (mdFiles.length > 0) {
      content += '## Notes\n';
      mdFiles.forEach(file => {
        content += `- [${file.name.replace('.md','')}](${file.name})\n`;
      });
    } else {
      content += '_No notes yet._\n';
    }

    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log(`✅ Created index.md for ${dir}`);
  }

  // Recurse into subdirectories
  items.filter(f => f.isDirectory()).forEach(sub => {
    generateIndex(path.join(dir, sub.name));
  });
}

// Run the generator
generateIndex(docsDir);
console.log('✅ All index.md files generated!');
