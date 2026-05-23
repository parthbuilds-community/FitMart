#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./review-pr.sh <pr-number>"
    exit 1
fi

PR=$1

echo -e "\nFetching PR #$PR..."

git fetch origin pull/$PR/head:pr-$PR
git checkout pr-$PR

echo -e "\nChecked out PR #$PR successfully."
