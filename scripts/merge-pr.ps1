param(
    [string]$pr
)

# Get PR details from GitHub CLI
$prData = gh pr view $pr --json headRefName,headRepositoryOwner | ConvertFrom-Json

$branch = $prData.headRefName
$user = $prData.headRepositoryOwner.login

Write-Host "`nPreparing merge for PR #$pr..."

git checkout main
git pull origin main

git merge --no-ff pr-$pr -m "Merge pull request #$pr from $user/$branch"

git push origin main

git branch -D pr-$pr

Write-Host "`nPR #$pr merged successfully."