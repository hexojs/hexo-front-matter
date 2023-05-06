/**
 * @type {{ [key: string]: import("lint-staged").Commands | import("lint-staged").ConfigFn }}
 */
const config = {
  '*.ts': 'eslint --fix',
  '*.js': 'eslint --fix',
  '*.json': 'npx prettier --write',
  '*.yml': 'npx prettier --write'
};

module.exports = config;
