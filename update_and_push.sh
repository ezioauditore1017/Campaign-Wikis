#!/bin/bash

# Navigate to the docs folder (adjust if needed)
cd "$(dirname "$0")/docs" || exit

echo "Generating sidebar..."
node ../generate_sidebar.mjs

echo "Committing changes..."
git add _sidebar.md
git commit -m "Update sidebar"

echo "Pushing to GitHub..."
git push origin main  # or your branch name

echo "✅ Sidebar updated and pushed!"
