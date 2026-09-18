#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: npm run release -- <patch|minor|major>"
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
