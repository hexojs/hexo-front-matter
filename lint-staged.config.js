'use strict';

/**
 * @type {{ [key: string]: import("lint-staged").Commands | import("lint-staged").ConfigFn }}
 */
const config = {
  '*.ts': ['npx prettier --write', 'eslint --fix'],
  '*.html': ['npx eslint --fix', 'prettier --write'],
  '*.scss': 'npx prettier --write',
  '*.json': 'npx prettier --write',
  '*.yml': 'npx prettier --write'
};

module.exports = config;
