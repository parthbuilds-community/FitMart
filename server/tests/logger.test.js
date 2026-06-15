const logger = require('../middleware/logger');
const { getBaseRoute, redact } = logger;

describe('logger.getBaseRoute', () => {
  it('returns the path unchanged for a simple route', () => {
    expect(getBaseRoute('/api/products')).toBe('/api/products');
  });

  it('strips the query string', () => {
    expect(getBaseRoute('/api/products?search=shoes&page=2')).toBe('/api/products');
  });

  it('never leaks sensitive query params (e.g. tokens/signatures)', () => {
    const result = getBaseRoute('/api/payment/verify?signature=supersecret&token=abc');
    expect(result).toBe('/api/payment/verify');
    expect(result).not.toContain('supersecret');
    expect(result).not.toContain('abc');
  });

  it('strips URL fragments', () => {
    expect(getBaseRoute('/api/products#section')).toBe('/api/products');
  });

  it('collapses Mongo ObjectId segments to :id', () => {
    expect(getBaseRoute('/api/orders/507f1f77bcf86cd799439011')).toBe('/api/orders/:id');
  });

  it('collapses numeric id segments to :id', () => {
    expect(getBaseRoute('/api/orders/12345')).toBe('/api/orders/:id');
  });

  it('collapses UUID segments to :id', () => {
    expect(getBaseRoute('/api/user/3f2504e0-4f89-41d3-9a0c-0305e82c3301/profile'))
      .toBe('/api/user/:id/profile');
  });

  it('normalizes ids in the middle of a path', () => {
    expect(getBaseRoute('/api/user/507f1f77bcf86cd799439011/orders'))
      .toBe('/api/user/:id/orders');
  });

  it('works for routes outside the old hardcoded allowlist', () => {
    // Previously only cart/products/orders were simplified; everything else
    // logged raw. Now all routes are handled generically.
    expect(getBaseRoute('/api/chat/507f1f77bcf86cd799439011?q=secret'))
      .toBe('/api/chat/:id');
  });

  it('handles empty/undefined input gracefully', () => {
    expect(getBaseRoute('')).toBe('');
    expect(getBaseRoute(undefined)).toBe('');
  });
});

describe('logger.redact', () => {
  it('redacts top-level sensitive keys', () => {
    expect(redact({ password: 'hunter2', name: 'Bob' }))
      .toEqual({ password: '[REDACTED]', name: 'Bob' });
  });

  it('is case-insensitive', () => {
    const result = redact({ Password: 'x', TOKEN: 'y', Authorization: 'z' });
    expect(result).toEqual({
      Password: '[REDACTED]',
      TOKEN: '[REDACTED]',
      Authorization: '[REDACTED]',
    });
  });

  it('matches keys regardless of separators (api_key, api-key, apiKey)', () => {
    const result = redact({ api_key: 'a', 'api-key': 'b', apiKey: 'c' });
    expect(result).toEqual({
      api_key: '[REDACTED]',
      'api-key': '[REDACTED]',
      apiKey: '[REDACTED]',
    });
  });

  it('catches partial matches like accessToken and confirmPassword', () => {
    const result = redact({
      accessToken: 'a',
      refreshToken: 'b',
      confirmPassword: 'c',
      clientSecret: 'd',
    });
    expect(result).toEqual({
      accessToken: '[REDACTED]',
      refreshToken: '[REDACTED]',
      confirmPassword: '[REDACTED]',
      clientSecret: '[REDACTED]',
    });
  });

  it('redacts nested sensitive fields', () => {
    const input = {
      user: { name: 'Bob', password: 'hunter2' },
      payment: { cardNumber: '4111111111111111', amount: 50 },
    };
    expect(redact(input)).toEqual({
      user: { name: 'Bob', password: '[REDACTED]' },
      payment: { cardNumber: '[REDACTED]', amount: 50 },
    });
  });

  it('redacts sensitive fields inside arrays', () => {
    const input = { items: [{ token: 'a', id: 1 }, { token: 'b', id: 2 }] };
    expect(redact(input)).toEqual({
      items: [{ token: '[REDACTED]', id: 1 }, { token: '[REDACTED]', id: 2 }],
    });
  });

  it('leaves non-sensitive data intact', () => {
    const input = { name: 'Bob', quantity: 3, tags: ['a', 'b'] };
    expect(redact(input)).toEqual(input);
  });

  it('does not mutate the original object', () => {
    const input = { password: 'hunter2', nested: { secret: 's' } };
    const copy = JSON.parse(JSON.stringify(input));
    redact(input);
    expect(input).toEqual(copy);
  });

  it('handles primitives and null safely', () => {
    expect(redact(null)).toBe(null);
    expect(redact('hello')).toBe('hello');
    expect(redact(42)).toBe(42);
  });
});
