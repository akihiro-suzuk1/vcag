#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: npm run release -- <patch|minor|major>"
  exit 1
fi

git fetch origin main
if [ "$(git rev-list --count HEAD..origin/main)" -gt 0 ]; then
  echo "origin/main has commits not in HEAD. Pull them before releasing."
  exit 1
fi

npm version "$1"
npm run build

VERSION=$(node -p "require('./package.json').version")
VSIX="vcag-${VERSION}.vsix"

npx ovsx publish "$VSIX"
npx vsce publish --packagePath "$VSIX"
git push origin main --tags
gh release create "v${VERSION}" "$VSIX" --title "v${VERSION}" --target main --generate-notes
