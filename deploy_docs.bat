@echo off
echo Generating index.md files and _sidebar.md...
node generate_sidebar_and_index.mjs

echo Staging all changes...
git add -A

echo Committing changes...
git commit -m "Force update Docsify site %date% %time%"

echo Force pushing to GitHub...
git push origin main --force

echo ✅ Docs folder updated, force pushed, and site opened!

pause
