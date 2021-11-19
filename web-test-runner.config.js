const esbuildPlugin = require("@web/dev-server-esbuild").esbuildPlugin;

module.exports = {
  files: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
}