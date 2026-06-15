// Regression test for: "Admin product updates do not invalidate Redis product cache".
//
// Root cause: node-redis v5/v6 `scanIterator` yields ARRAYS (batches) of keys
// per iteration, but the old delPattern treated each yield as a single key
// string. The resulting nested array was passed to del(), which deleted
// nothing — so admin create/update/delete left stale `products:` cache entries.

const cache = require('../lib/cache');

afterEach(() => {
  // restore the singleton to its default (in-memory) state between tests
  cache.enabled = false;
  cache.client = null;
  cache.mem.clear();
});

// A minimal fake of the node-redis v6 client whose scanIterator yields BATCHES
// of keys (arrays), matching the real client's behavior.
function makeNodeRedisV6Client(storedKeys) {
  const deleted = [];
  return {
    deleted,
    // v6: yields arrays of keys, in batches
    async *scanIterator({ MATCH }) {
      const re = new RegExp('^' + MATCH.replace('*', '.*') + '$');
      const matching = storedKeys.filter((k) => re.test(k));
      // emit in two batches to prove batching is handled
      const mid = Math.ceil(matching.length / 2);
      if (matching.slice(0, mid).length) yield matching.slice(0, mid);
      if (matching.slice(mid).length) yield matching.slice(mid);
    },
    // node-redis del is variadic
    async del(...keys) {
      deleted.push(...keys);
      return keys.length;
    },
  };
}

// A fake Upstash client: no scanIterator, has keys(), variadic del().
function makeUpstashClient(storedKeys) {
  const deleted = [];
  return {
    deleted,
    async keys(pattern) {
      const re = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return storedKeys.filter((k) => re.test(k));
    },
    async del(...keys) {
      deleted.push(...keys);
      return keys.length;
    },
  };
}

describe('cache.delPattern', () => {
  it('deletes all matching keys when scanIterator yields batches (node-redis v6)', async () => {
    const stored = ['products:aaa', 'products:bbb', 'products:ccc', 'cart:xyz'];
    const client = makeNodeRedisV6Client(stored);
    cache.enabled = true;
    cache.client = client;

    await cache.delPattern('products:');

    expect(client.deleted.sort()).toEqual(['products:aaa', 'products:bbb', 'products:ccc']);
    // del must receive flat strings, never nested arrays
    client.deleted.forEach((k) => expect(typeof k).toBe('string'));
  });

  it('does not call del when nothing matches', async () => {
    const client = makeNodeRedisV6Client(['cart:1', 'user:2']);
    cache.enabled = true;
    cache.client = client;

    await cache.delPattern('products:');

    expect(client.deleted).toEqual([]);
  });

  it('works with a keys()-based client (Upstash)', async () => {
    const stored = ['products:1', 'products:2', 'orders:9'];
    const client = makeUpstashClient(stored);
    cache.enabled = true;
    cache.client = client;

    await cache.delPattern('products:');

    expect(client.deleted.sort()).toEqual(['products:1', 'products:2']);
  });

  it('falls back to in-memory deletion when Redis is disabled', async () => {
    cache.enabled = false;
    cache.client = null;
    cache.mem.set('products:a', 1);
    cache.mem.set('products:b', 2);
    cache.mem.set('cart:c', 3);

    await cache.delPattern('products:');

    expect(cache.mem.has('products:a')).toBe(false);
    expect(cache.mem.has('products:b')).toBe(false);
    expect(cache.mem.has('cart:c')).toBe(true);
  });
});
