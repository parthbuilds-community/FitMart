/** @type {import('jest').Config} */
module.exports = {
  // Look for tests in server/tests/ only
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.test.ts'],

  // Node environment (not jsdom — this is server-side code)
  testEnvironment: 'node',

  // Increase timeout for mongodb-memory-server startup (can take 10–20 seconds
  // on first run while it downloads the MongoDB binary)
  testTimeout: 60000,

  // Show individual test names in output (easier to diagnose failures)
  verbose: true,

  // Force Jest to exit after all tests complete (avoids hanging on open handles)
  forceExit: true,

  // Clear mocks between tests
  clearMocks: true,

  // Compile TypeScript tests and modules with ts-jest. Plain .js files keep
  // running untransformed.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },

  // Shared domain types live outside server/ and are imported via this alias.
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^zod$': '<rootDir>/node_modules/zod',
  },
};
