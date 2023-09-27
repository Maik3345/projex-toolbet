export const HUSKY_COMMIT_MESSAGE_CODE = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit \${1}\

branch="$(git rev-parse --abbrev-ref HEAD | sed \'s/^origin\\///\')" 
commitMsgFile=$1
msg=$(cat "$commitMsgFile")
echo "$branch: $msg" > "$commitMsgFile"
`;

export const COMMIT_LINT_SETTINGS_CODE = `module.exports = {extends: [\'@commitlint/config-conventional'\]}`;
