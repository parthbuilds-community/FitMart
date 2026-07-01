let createClient = null;
try {
  const _redis = require('redis');
  createClient = _redis && _redis.createClient ? _redis.createClient : null;
} catch (e) {
  createClient = null;
}

let upstashClient = null;
let useUpstash = false;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require('@upstash/redis');
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    useUpstash = true;
  }
} catch (e) {
  useUpstash = false;
}

const EventEmitter = require('events');

const logger = require('./logger');
class Cache extends EventEmitter {
  constructor() {
    super();
    this.enabled = false;
    this.ttl = Number(process.env.PRODUCTS_CACHE_TTL || 60);
    this.client = null;
    this.mem = new Map();
    this.init();
  }

  async init() {
    // Prefer Upstash (serverless-friendly) when configured
    if (useUpstash && upstashClient) {
      this.client = upstashClient;
      this.enabled = true;
      logger.info('[cache] Connected to Upstash Redis');
      return;
    }

    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (!createClient || !redisUrl) {
      logger.warn('[cache] Redis not configured — using in-memory fallback');
      this.enabled = false;
      return;
    }

    try {
      const client = createClient({ url: redisUrl });
      client.on('error', (err) => {
        if (process.env.DEBUG_REDIS === 'true') {
          logger.warn('[redis] error (full):', err);
        } else {
          const msg = err && (err.message || err.code || String(err))
            ? (err.message || err.code || String(err))
            : '<no-message>';
          logger.warn('[redis] error', msg);
        }
      });
      await client.connect();
      this.client = client;
      this.enabled = true;
      logger.info('[cache] Connected to Redis');
    } catch (err) {
      if (process.env.DEBUG_REDIS === 'true') {
        logger.warn('[cache] Redis connection failed — falling back to memory cache (full):', err);
      } else {
        logger.warn('[cache] Redis connection failed — falling back to memory cache', this._errMsg(err));
      }
      this.enabled = false;
    }
  }

  _serializeKey(key) {
    if (typeof key === 'string') return key;
    return JSON.stringify(key);
  }

  _errMsg(err) {
    if (!err) return '<no-message>';
    if (typeof err === 'string') return err;
    return err.message || err.code || String(err) || '<no-message>';
  }

  async get(key) {
    const k = this._serializeKey(key);
    if (this.enabled && this.client) {
      try {
        const val = await this.client.get(k);
        if (val === null || val === undefined) return null;
        try { return JSON.parse(val); } catch (e) { return val; }
      } catch (err) {
        logger.warn('[cache] redis get failed', this._errMsg(err));
        if (process.env.DEBUG_REDIS === 'true') logger.error(err);
        return null;
      }
    }
    const v = this.mem.get(k);
    return v === undefined ? null : v;
  }

  async set(key, value, ttlSec) {
    const k = this._serializeKey(key);
    const ttl = typeof ttlSec === 'number' ? ttlSec : this.ttl;
    if (this.enabled && this.client) {
      try {
        // try setting with expiry option; different clients accept different arg shapes
        try {
          await this.client.set(k, JSON.stringify(value), { EX: ttl });
        } catch (e) {
          // fallback: try lowercase option name or no options
          try { await this.client.set(k, JSON.stringify(value), { ex: ttl }); } catch (e2) { await this.client.set(k, JSON.stringify(value)); }
        }
        return true;
      } catch (err) {
        logger.warn('[cache] redis set failed', this._errMsg(err));
        if (process.env.DEBUG_REDIS === 'true') logger.error(err);
        return false;
      }
    }
    this.mem.set(k, value);
    setTimeout(() => this.mem.delete(k), ttl * 1000);
    return true;
  }

  async delPattern(prefix) {
    if (this.enabled && this.client) {
      try {
        // use SCAN to find matching keys and delete (if supported)
        if (typeof this.client.scanIterator === 'function') {
          const iter = this.client.scanIterator({ MATCH: `${prefix}*` });
          const keys = [];
          for await (const k of iter) keys.push(k);
          if (keys.length) await this.client.del(keys);
        } else if (typeof this.client.keys === 'function') {
          const keys = await this.client.keys(`${prefix}*`);
          if (keys && keys.length) await this.client.del(keys);
        } else {
          // client doesn't support pattern deletion via SDK; fallback to flush (dangerous) or skip
          logger.warn('[cache] delPattern not supported by Redis client');
        }
      } catch (err) {
        logger.warn('[cache] redis delPattern failed', this._errMsg(err));
        if (process.env.DEBUG_REDIS === 'true') logger.error(err);
      }
      return;
    }
    for (const k of Array.from(this.mem.keys())) {
      if (k.startsWith(prefix)) this.mem.delete(k);
    }
  }

  async clearAll() {
    if (this.enabled && this.client) {
      try { await this.client.flushDb(); } catch (err) { logger.warn('[cache] flushDb failed', this._errMsg(err)); if (process.env.DEBUG_REDIS === 'true') logger.error(err); }
      return;
    }
    this.mem.clear();
  }
}

module.exports = new Cache();
