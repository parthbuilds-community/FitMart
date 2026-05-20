/**
 * Industry Standard Health Calculation Utilities
 * Based on the Mifflin-St Jeor Equation and WHO BMI Categories
 */

export const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm || heightCm <= 0) return 0;

  // Convert height from cm to meters
  const heightMeters = heightCm / 100;
  
  // Formula: weight (kg) / [height (m)]^2
  const bmi = weight / (heightMeters * heightMeters);
  
  return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (bmi <= 0) return "Invalid Input";
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal Weight";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  return "Obese";
};

export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return 0;

  // Mifflin-St Jeor Equation
  // Male: 10*weight + 6.25*height - 5*age + 5
  // Female: 10*weight + 6.25*height - 5*age - 161
  const genderAdjustment = gender === "male" ? 5 : -161;
  
  return (10 * weight) + (6.25 * height) - (5 * age) + genderAdjustment;
};

export const calculateTDEE = (bmr, activityMultiplier) => {
  return Math.round(bmr * activityMultiplier);
};

/**
 * Recommendation Logic: Maps health data to FitMart Product Categories
 */
export const getRecommendedCategory = (bmi) => {
  if (bmi < 18.5) return "Nutrition"; // Focus on Mass Gainers/Proteins
  if (bmi >= 25) return "Equipment";   // Focus on Cardio/Fat burning tools
  return "Nutrition";                 // General wellness/Maintenance
};

/**
 * Calculate calorie targets for weight loss scenarios
 * Multipliers:
 * - 0.25 kg/week = maintenance +/- 250 kcal/day
 * - 0.5 kg/week = maintenance +/- 500 kcal/day
 * - 1 kg/week = maintenance +/- 1000 kcal/day
 */
export const calculateWeightLossCalories = (tdee) => {
  if (!tdee) return { mild: 0, moderate: 0, extreme: 0 };
  
  return {
    mild: Math.round(tdee - 250),         // 0.25 kg/week loss
    moderate: Math.round(tdee - 500),     // 0.5 kg/week loss
    extreme: Math.round(tdee - 1000),     // 1 kg/week loss
  };
};

/**
 * Calculate calorie targets for weight gain scenarios
 * Multipliers:
 * - 0.25 kg/week = maintenance +/- 250 kcal/day
 * - 0.5 kg/week = maintenance +/- 500 kcal/day
 * - 1 kg/week = maintenance +/- 1000 kcal/day
 */
export const calculateWeightGainCalories = (tdee) => {
  if (!tdee) return { mild: 0, moderate: 0, fast: 0 };
  
  return {
    mild: Math.round(tdee + 250),         // 0.25 kg/week gain
    moderate: Math.round(tdee + 500),     // 0.5 kg/week gain
    fast: Math.round(tdee + 1000),        // 1 kg/week gain
  };
};
