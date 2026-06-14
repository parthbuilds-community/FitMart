const { getFallbackResponse } = require("../config/chatConfig");

describe("getFallbackResponse", () => {
  test("returns protein fallback response", () => {
    expect(getFallbackResponse("protein")).toBe(
      "**For optimal protein intake**, aim for **1.6-2.2g per kg** of body weight daily. Good sources include **chicken breast (31g/100g)**, **eggs (6g each)**, **Greek yogurt (10g/100g)**, **lentils (9g/100g)**, and **quality whey protein**. Would you like me to recommend some protein supplements from our store?"
    );
  });

  test("returns workout fallback response", () => {
    expect(getFallbackResponse("workout")).toBe(
      "**A balanced workout routine** should include: **3-4 strength training sessions** per week focusing on compound movements (**squats, deadlifts, bench press, rows**), plus **2-3 cardio sessions**. Start with **3 sets of 8-12 reps** for each exercise. Remember to **warm up for 5-10 minutes** and **cool down with stretching**!"
    );
  });

  test("returns weight loss fallback response", () => {
    expect(getFallbackResponse("weight loss")).toBe(
      "**For sustainable weight loss**: Create a **moderate calorie deficit (300-500 calories below maintenance)**, **prioritize protein intake (1.6-2g per kg body weight)**, combine **strength training with cardio**, get **7-9 hours of sleep**, and **stay hydrated**. Aim for **0.5-1kg loss per week** for healthy results."
    );
  });

  test("returns muscle gain fallback response", () => {
    expect(getFallbackResponse("muscle gain")).toBe(
      "**For muscle gain**: Consume a **slight calorie surplus (200-300 above maintenance)**, eat **1.6-2.2g protein per kg body weight**, focus on **progressive overload** in your training, get **adequate sleep (7-9 hours)**, and **stay consistent** with your workouts. **Compound exercises** like **squats, deadlifts, and bench press** are key!"
    );
  });

  test("returns default response for unrelated query", () => {
    expect(getFallbackResponse("what is the weather today")).toBe(
      "I'm here to help with your fitness journey! Feel free to ask about **workouts**, **nutrition**, **protein intake**, **weight loss**, or **muscle gain**. What specific aspect of fitness would you like to know more about?"
    );
  });
});