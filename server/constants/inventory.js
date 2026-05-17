const LOW_STOCK_THRESHOLD = Number.parseInt(
  process.env.LOW_STOCK_THRESHOLD,
  10,
);

module.exports = {
  LOW_STOCK_THRESHOLD: Number.isFinite(LOW_STOCK_THRESHOLD)
    ? LOW_STOCK_THRESHOLD
    : 5,
};
