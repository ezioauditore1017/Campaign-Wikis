# Move to the script's directory
cd $PSScriptRoot

Write-Output "Generating sidebar..."
# Generate sidebar directly in docs/
node generate_sidebar.mjs docs/_sidebar.md

# Stage all changes in docs/
git add docs/

# Check if there are staged changes
$changes = git diff --cached --quiet; $status=$?
if ($status -eq 1) {
    $commitMsg = "Update Docsify site $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMsg
    Write-Output "Pushing to GitHub..."
    git push origin main
    Write-Output "✅ Docs folder updated and pushed!"
} else {
    Write-Output "No changes to commit."
}

Read-Host -Prompt "Press Enter to exit"
