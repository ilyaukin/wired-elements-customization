const esbuildPlugin = require("@web/dev-server-esbuild").esbuildPlugin;

module.exports = {
  files: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
}