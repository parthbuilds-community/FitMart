#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./merge-pr.sh <pr-number>"
    exit 1
fi

PR=$1

# Get PR details from GitHub CLI
PR_DATA=$(gh pr view $PR --json headRefName,headRepositoryOwner -t '{{.headRefName}} {{.headRepositoryOwner.login}}')

if [ $? -ne 0 ]; then
    echo "Error fetching PR details from GitHub CLI."
    exit 1
fi

BRANCH=$(echo "$PR_DATA" | awk '{print $1}')
USER=$(echo "$PR_DATA" | awk '{print $2}')

echo -e "\nPreparing merge for PR #$PR..."

git checkout main
git pull origin main

git merge --no-ff pr-$PR -m "Merge pull request #$PR from $USER/$BRANCH"

git push origin main

git branch -D pr-$PR

echo -e "\nPR #$PR merged successfully."
