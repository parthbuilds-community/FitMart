module.exports = {
  POINTS_PER_RUPEE: 1,
  RUPEES_PER_POINT: 0.1,          // 10 points = ₹1 discount
  MAX_REDEMPTION_PERCENT: 50,     // max 50% of order total can be paid via points
  MIN_POINTS_TO_REDEEM: 100,      // minimum points required to redeem
  FIRST_PURCHASE_BONUS: 100,
  WORKOUT_POINTS: 25,
  MILESTONE_POINTS: 50,

  TIERS: [
    { name: "Bronze", minPoints: 0 },
    { name: "Silver", minPoints: 500 },
    { name: "Gold", minPoints: 1500 },
    { name: "Platinum", minPoints: 3000 },
  ],
};