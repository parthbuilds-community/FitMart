/**
 * Array of reward tier definitions with minimum point requirements.
 * @type {Array<{name: string, min: number}>}
 */
export const REWARD_TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 500 },
  { name: "Gold", min: 1500 },
  { name: "Platinum", min: 3000 },
];

/**
 * Determines the current and next reward tier based on points.
 * @param {number} points - The user's current points (default: 0)
 * @returns {{currentTier: {name: string, min: number}, nextTier: {name: string, min: number}|null}}
 */
export const getRewardTier = (points = 0) => {
  let currentTier = REWARD_TIERS[0];
  let nextTier = null;

  for (let i = 0; i < REWARD_TIERS.length; i++) {
    if (points >= REWARD_TIERS[i].min) {
      currentTier = REWARD_TIERS[i];
      nextTier = REWARD_TIERS[i + 1] || null;
    }
  }

  return {
    currentTier,
    nextTier,
  };
};

/**
 * Calculates progress towards the next reward tier.
 * @param {number} points - The user's current points (default: 0)
 * @returns {{progress: number, pointsToNextTier: number, label: string}} Progress percentage and info
 */
export const getTierProgress = (points = 0) => {
  const { currentTier, nextTier } = getRewardTier(points);

  if (!nextTier) {
    return {
      progress: 100,
      pointsToNextTier: 0,
      label: "You are at the highest tier",
    };
  }

  const currentMin = currentTier.min;
  const nextMin = nextTier.min;
  const progress = ((points - currentMin) / (nextMin - currentMin)) * 100;
  const pointsToNextTier = nextMin - points;

  return {
    progress: Math.min(Math.max(progress, 0), 100),
    pointsToNextTier,
    label: `${pointsToNextTier} points to ${nextTier.name}`,
  };
};

/**
 * Formats a date as a relative time string (e.g., "Today", "Yesterday", "5 days ago").
 * @param {string|Date} dateValue - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const today = new Date();

  const diffTime = today - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

/**
 * Returns a human-readable label for a transaction based on its type.
 * @param {Object} transaction - Transaction object with type/sourceType properties
 * @returns {string} Human-readable transaction label
 */
export const getTransactionLabel = (transaction) => {
  const type = transaction?.sourceType || transaction?.type || "reward";

  if (type === "purchase") return "Purchase reward";
  if (type === "workout") return "Workout reward";
  if (type === "milestone") return "Milestone reward";

  return transaction?.description || "FitRewards points";
};

/**
 * Returns an emoji icon for a transaction based on its type.
 * @param {Object} transaction - Transaction object with type/sourceType properties
 * @returns {string} Emoji icon representing the transaction type
 */
export const getTransactionIcon = (transaction) => {
  const type = transaction?.sourceType || transaction?.type || "reward";

  if (type === "purchase") return "🛍️";
  if (type === "workout") return "🏋️";
  if (type === "milestone") return "🏆";

  return "⭐";
};