#!/bin/bash

# Navigate to the script's folder (root of your repo)
cd "$(dirname "$0")"

# Step 1: Regenerate sidebar
echo "Generating sidebar..."
node generate_sidebar.mjs

# Step 2: Commit changes inside docs/
echo "Adding docs folder..."
git add docs/

# Commit with timestamp
msg="Update Docsify site $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$msg"

# Step 3: Push to GitHub
echo "Pushing docs/ to GitHub..."
git push origin main

echo "✅ Docs folder updated and pushed to GitHub Pages!"
