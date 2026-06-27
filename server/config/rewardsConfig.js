module.exports = {
  POINTS_PER_RUPEE: 1,
  FIRST_PURCHASE_BONUS: 100,
  WORKOUT_POINTS: 25,
  MILESTONE_POINTS: 50,

  // Points expiry configuration
  EXPIRY_MONTHS: 6,                    // points expire after 6 months
  EXPIRY_CRON_SCHEDULE: "0 0 * * *",  // run daily at midnight

  TIERS: [
    { name: "Bronze", minPoints: 0 },
    { name: "Silver", minPoints: 500 },
    { name: "Gold", minPoints: 1500 },
    { name: "Platinum", minPoints: 3000 },
  ],
};