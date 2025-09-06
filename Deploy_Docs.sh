#!/bin/bash
cd "$(dirname "$0")"

echo "Generating sidebar..."
node generate_sidebar.mjs

echo "Adding docs folder..."
git add docs/

msg="Update Docsify site $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$msg"

echo "Pushing to GitHub..."
git push origin main

echo "✅ Docs folder updated and pushed!"
read -p "Press ENTER to close..."
