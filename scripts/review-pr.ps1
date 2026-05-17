param(
    [string]$pr
)

Write-Host "`nFetching PR #$pr..."

git fetch origin pull/$pr/head:pr-$pr

git checkout pr-$pr

Write-Host "`nChecked out PR #$pr successfully."