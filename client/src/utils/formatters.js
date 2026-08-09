// src/utils/formatters.js

/**
 * Formats a number as Indian Rupees (INR) currency.
 * @param {number} n - The number to format
 * @returns {string} The formatted currency string (e.g., "₹1,234")
 */
export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);