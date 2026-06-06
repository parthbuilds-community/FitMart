// Single source of truth for inventory-related thresholds
export const LOW_STOCK_THRESHOLD = Number(
  import.meta.env.VITE_LOW_STOCK_THRESHOLD ?? 5
);