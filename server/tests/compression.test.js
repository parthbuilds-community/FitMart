// Declare mockApp variable with the required 'mock' prefix so it can be assigned inside the mock factory
let mockApp;

// Mock db.js to avoid connecting to MongoDB and calling process.exit(1)
jest.mock('../db', () => ({}));

// Mock firebase-admin to skip credentials initialization
jest.mock('firebase-admin', () => ({
  apps: { length: 1 },
}));

jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  mockApp = actualExpress();

  mockApp.listen = jest.fn((port, cb) => {
    if (cb) cb();
    return { close: (c) => c && c() };
  });

  const exp = () => mockApp;
  Object.assign(exp, actualExpress);
  return exp;
});

// Mock environment variables required for index.js startup
process.env.MONGO_URI = 'mongodb://localhost:27017';
process.env.GEMINI_API_KEY = 'mock-key';

describe('Compression Middleware', () => {
  beforeAll(() => {
    // Require server/index.js to bootstrap mockApp
    require('../index');
  });

  test('should register compression middleware in the stack', () => {
    const router = mockApp.router || mockApp._router;
    expect(router).toBeDefined();
    const middlewareNames = router.stack.map(layer => layer.name);
    expect(middlewareNames).toContain('compression');
  });
});
