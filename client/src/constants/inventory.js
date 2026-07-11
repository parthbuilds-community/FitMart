const DEFAULT_LOW_STOCK_THRESHOLD = 5;

const parseNonNegativeInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const LOW_STOCK_THRESHOLD = parseNonNegativeInteger(
  import.meta.env.VITE_LOW_STOCK_THRESHOLD,
  DEFAULT_LOW_STOCK_THRESHOLD,
);
