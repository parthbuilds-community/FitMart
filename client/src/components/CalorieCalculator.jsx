// src/components/CalorieCalculator.jsx
import React, { useState, useEffect } from "react";
import {
  calculateBMR,
  calculateTDEE,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
} from "../utils/healthUtils";

const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "1.2",
  });

  const [result, setResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCalculate = (e) => {
    e.preventDefault();
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseInt(formData.age);
    const activity = parseFloat(formData.activityLevel);

    // Validation
    if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) {
      setResult(null);
      return;
    }

    const bmr = calculateBMR(w, h, a, formData.gender);
    const tdee = calculateTDEE(bmr, activity);
    const weightLoss = calculateWeightLossCalories(tdee);
    const weightGain = calculateWeightGainCalories(tdee);

    setResult({
      maintenance: tdee,
      weightLoss,
      weightGain,
    });
  };

  const activityOptions = [
    {
      label: "Sedentary (little or no exercise)",
      value: "1.2",
    },
    {
      label: "Light (exercise 1–3 times/week)",
      value: "1.375",
    },
    {
      label: "Moderate (exercise 4–5 times/week)",
      value: "1.55",
    },
    {
      label: "Active (daily exercise or intense 3–4 times/week)",
      value: "1.725",
    },
    {
      label: "Very Active (intense exercise 6–7 times/week)",
      value: "1.9",
    },
    {
      label: "Extra Active (very intense exercise daily, or physical job)",
      value: "2.0",
    },
  ];

  return (
    <div
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
        }`}
    >
      {/* Header */}
      <div className="mb-8 sm:mb-16">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">
          Nutrition Planning
        </p>
        <h1 className="font-['DM_Serif_Display'] text-2xl md:text-3xl text-stone-900
                       leading-[1.05] tracking-tight">
          Caloric Maintenance Calculator
        </h1>
      </div>

      {/* Main grid — stacks on mobile, side-by-side on lg+ */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">

        {/* ── Form Section ── */}
        <div
          className={`lg:col-span-7 bg-white border rounded-2xl p-5 sm:p-8 md:p-10
                      transition-all duration-500 ease-out
                      ${result
              ? "border-stone-300 shadow-md scale-[1.01] sm:scale-[1.02]"
              : "border-stone-200 shadow-sm hover:border-stone-300"
            }`}
        >
          <form onSubmit={handleCalculate} className="space-y-6 sm:space-y-8">

            {/* Gender Selection */}
            <div>
              <label
                className="block text-[10px] tracking-[0.15em] uppercase
                                 text-stone-400 mb-3 sm:mb-4"
              >
                Biological Gender
              </label>
              <div className="flex gap-2 sm:gap-3">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 py-3 px-4 sm:px-8 rounded-full text-xs tracking-widest
                                uppercase transition-all duration-300 border min-h-11
                                active:scale-[0.98]
                                ${formData.gender === g
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-transparent border-stone-200 text-stone-500 hover:border-stone-400"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs grid — single col on mobile, 2-col on sm+ */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="w-full border border-stone-200 bg-white rounded-lg px-4 py-3
                             text-sm text-stone-900 placeholder-stone-300 focus:outline-none
                             focus:border-stone-900 transition-colors min-h-11"
                  placeholder="e.g., 70.5"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">
                  Height (cm)
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-stone-200 bg-white rounded-lg px-4 py-3
                             text-sm text-stone-900 placeholder-stone-300 focus:outline-none
                             focus:border-stone-900 transition-colors min-h-11"
                  placeholder="e.g., 175"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">
                  Age
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-stone-200 bg-white rounded-lg px-4 py-3
                             text-sm text-stone-900 placeholder-stone-300 focus:outline-none
                             focus:border-stone-900 transition-colors min-h-11"
                  placeholder="e.g., 28"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">
                  Activity Level
                </label>
                <select
                  className="w-full border border-stone-200 bg-white rounded-lg px-4 py-3
                             text-sm text-stone-900 focus:outline-none focus:border-stone-900
                             transition-colors appearance-none min-h-11"
                  value={formData.activityLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, activityLevel: e.target.value })
                  }
                >
                  {activityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white text-sm tracking-widest uppercase
                         py-4 rounded-full hover:bg-stone-700 transition-colors shadow-sm
                         min-h-13 active:scale-[0.98]"
            >
              Calculate Calories
            </button>
          </form>
        </div>

        {/* ── Results Section ── */}
        <div className="lg:col-span-5">
          <div
            className={`rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-center
                        transition-all duration-500 min-h-70 sm:min-h-80 lg:h-full
                        ${result
                ? "bg-stone-900 text-white"
                : "bg-stone-100 border border-stone-200 text-stone-400"
              }`}
          >
            {result ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Maintenance */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">
                    Maintenance
                  </p>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-['DM_Serif_Display'] text-5xl sm:text-6xl leading-none">
                      {result.maintenance}
                    </span>
                    <span className="text-stone-400 text-xs tracking-widest uppercase">
                      Kcal / Day
                    </span>
                  </div>
                  <p className="mt-2 sm:mt-3 text-stone-300 text-xs tracking-wide">
                    Your daily energy expenditure
                  </p>
                </div>

                <div className="h-px bg-stone-800" />

                {/* Weight Loss */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">
                    Weight Loss Targets
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Mild (0.25 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightLoss.mild}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Moderate (0.5 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightLoss.moderate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Extreme (1 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightLoss.extreme}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-stone-800" />

                {/* Weight Gain */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">
                    Weight Gain Targets
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Mild (0.25 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightGain.mild}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Moderate (0.5 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightGain.moderate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">
                        Fast (1 kg/week)
                      </span>
                      <span className="text-white font-medium">
                        {result.weightGain.fast}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col h-full justify-center items-center
                            text-center px-4 sm:px-6 transition-all duration-500 py-8 lg:py-0"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center
                              justify-center mb-5 sm:mb-6 shadow-sm border border-stone-200
                              text-stone-300"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.469 1.469 3.662 1.754 5.921 1.009M6 12a6 6 0 1112 0m-9-9h.01M9 9h.01M15 9h.01"
                    />
                  </svg>
                </div>
                <h3
                  className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900
                             mb-3 tracking-tight"
                >
                  Ready to Calculate.
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
                  Enter your details and activity level to discover your personalized
                  caloric targets for weight loss, maintenance, and gain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
