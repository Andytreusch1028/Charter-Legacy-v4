/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    prefix: 'https://import-graph.local/',
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/|src/shared/',
      },
    },
  },
  forbidden: [
    // prevent deep imports across features; prefer public API barrels
    {
      name: 'no-cross-feature-deep-imports',
      severity: 'warn',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/index\.(ts|tsx|js|jsx)$',
      },
    },
    // ban circular dependencies
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
};
