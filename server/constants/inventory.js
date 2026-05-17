const DEFAULT_LOW_STOCK_THRESHOLD = 5;

const parsed = Number.parseInt(process.env.LOW_STOCK_THRESHOLD ?? '', 10);

const LOW_STOCK_THRESHOLD =
  Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LOW_STOCK_THRESHOLD;

module.exports = { LOW_STOCK_THRESHOLD };
