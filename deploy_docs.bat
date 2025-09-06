@echo off
cd /d "%~dp0"

REM ============================
REM 1️⃣ Delete all subfolder index.md files except main docs/index.md
REM ============================
for /r docs\ %%f in (index.md) do (
    if /i not "%%f"=="%cd%\docs\index.md" del "%%f"
)

REM ============================
REM 2️⃣ Generate sidebar
REM ============================
echo 🔄 Generating nested sidebar...
node generate_sidebar.mjs

REM ============================
REM 3️⃣ Fix Index.html filename
REM ============================
if exist docs\Index.html ren docs\Index.html index.html

REM ============================
REM 4️⃣ Stage all docs folder changes
REM ============================
git add -A docs/

REM ============================
REM 5️⃣ Commit only if there are changes
REM ============================
git diff --cached --quiet
if %errorlevel%==1 (
    set commitMsg=Update Docsify site %date% %time%
    git commit -m "%commitMsg%"
    echo ⬆️ Pushing changes to GitHub...
    git push origin main
    echo ✅ Docs folder updated and pushed!
) else (
    echo ⚡ No changes to commit.
)

pause
