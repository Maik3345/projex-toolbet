export const HUSKY_COMMIT_MESSAGE_CODE = `npx --no -- commitlint --edit \${1}

branch="$(git rev-parse --abbrev-ref HEAD | sed \'s/^origin\\///\')" 
commitMsgFile=$1
msg=$(cat "$commitMsgFile")
echo "$branch: $msg" > "$commitMsgFile"
`;

export const COMMIT_LINT_SETTINGS_CODE = `module.exports = {
  extends: [\'@commitlint/config-conventional'\],
  rules: {
    'header-max-length': [0, 'always', 200], // Aumenta el límite a 200 caracteres o establece 0 para deshabilitar
    'body-max-line-length': [0, 'always'], // Deshabilita el límite de longitud en el cuerpo del mensaje
    'footer-max-line-length': [0, 'always'], // Deshabilita el límite de longitud en el pie del mensaje
  }
};`;
