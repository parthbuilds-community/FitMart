const request = require('supertest');
const express = require('express');

// Isolate the route from auth, Firebase, email side-effects and the database.
jest.mock('../middleware/verifyFirebaseToken', () => (req, res, next) => next());
jest.mock('../middleware/verifyAdmin', () => (req, res, next) => next());
jest.mock('../firebaseAdmin', () => ({}));
jest.mock('../services/inactiveCustomerEmailService', () => ({ sendInactivityReminderEmail: jest.fn() }));
jest.mock('../models/Order', () => ({ aggregate: jest.fn(), find: jest.fn() }));
jest.mock('../models/UserProfile', () => ({ findOne: jest.fn() }));
jest.mock('../lib/resolveFirebaseUser', () => jest.fn());

const Order = require('../models/Order');
const UserProfile = require('../models/UserProfile');
const resolveFirebaseUser = require('../lib/resolveFirebaseUser');
const customersRouter = require('../routes/customers');

describe('GET /api/customers pagination', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use('/api/customers', customersRouter);
  });

  afterEach(() => jest.resetAllMocks());

  // Customers are pre-sorted by totalSpend desc, matching the aggregation.
  const makeCustomers = (n) =>
    Array.from({ length: n }).map((_, i) => ({
      userId: `u${i + 1}`,
      orderCount: n - i,
      totalSpend: (n - i) * 1000,
      firstOrder: '2026-01-01T00:00:00.000Z',
      lastOrder: '2026-02-01T00:00:00.000Z',
    }));

  test('returns only the requested page, with full-population meta and stats', async () => {
    Order.aggregate.mockResolvedValueOnce(makeCustomers(5));
    UserProfile.findOne.mockResolvedValue(null);
    resolveFirebaseUser.mockResolvedValue({ displayName: 'Test', email: 't@example.com', photoURL: null });

    const res = await request(app).get('/api/customers?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 2, total: 5, totalPages: 3 });
    expect(res.body.stats.total).toBe(5);
  });

  test('only resolves Firebase users for the current page, not every customer', async () => {
    Order.aggregate.mockResolvedValueOnce(makeCustomers(10));
    UserProfile.findOne.mockResolvedValue(null);
    resolveFirebaseUser.mockResolvedValue({ displayName: 'Test', email: 't@example.com', photoURL: null });

    await request(app).get('/api/customers?page=2&limit=3');

    // The whole point of the change: a page of 3 triggers 3 lookups, not 10.
    expect(resolveFirebaseUser).toHaveBeenCalledTimes(3);
  });

  test('?all=true preserves the original full-list behaviour', async () => {
    Order.aggregate.mockResolvedValueOnce(makeCustomers(7));
    UserProfile.findOne.mockResolvedValue(null);
    resolveFirebaseUser.mockResolvedValue({ displayName: 'Test', email: 't@example.com', photoURL: null });

    const res = await request(app).get('/api/customers?all=true');

    expect(res.body.data).toHaveLength(7);
    expect(res.body.meta).toMatchObject({ page: 1, total: 7, totalPages: 1 });
    expect(resolveFirebaseUser).toHaveBeenCalledTimes(7);
  });

  test('returns an empty, well-formed payload when there are no customers', async () => {
    Order.aggregate.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
    expect(res.body.stats.total).toBe(0);
    expect(resolveFirebaseUser).not.toHaveBeenCalled();
  });
});
