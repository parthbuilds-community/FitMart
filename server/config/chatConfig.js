const PRODUCT_KEYWORDS = ["protein", "supplement", "muscle", "gain", "whey", "creatine", "mass"];

const SYSTEM_PROMPT = `You are FitMart's expert fitness assistant.
Only answer questions related to: workouts, exercise routines, diet, nutrition, 
protein intake, weight loss, muscle gain, and supplements.
If the question is unrelated to fitness, politely redirect the user.
Keep answers concise, practical, and friendly. Use short paragraphs.
**Use bold text (surround important words with **) to highlight key information like numbers, recommendations, and important terms.**`;

const getFallbackResponse = (message) => {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("protein")) {
    return "**For optimal protein intake**, aim for **1.6-2.2g per kg** of body weight daily. Good sources include **chicken breast (31g/100g)**, **eggs (6g each)**, **Greek yogurt (10g/100g)**, **lentils (9g/100g)**, and **quality whey protein**. Would you like me to recommend some protein supplements from our store?";
  }
  else if (lowerMsg.includes("workout") || lowerMsg.includes("exercise")) {
    return "**A balanced workout routine** should include: **3-4 strength training sessions** per week focusing on compound movements (**squats, deadlifts, bench press, rows**), plus **2-3 cardio sessions**. Start with **3 sets of 8-12 reps** for each exercise. Remember to **warm up for 5-10 minutes** and **cool down with stretching**!";
  }
  else if (lowerMsg.includes("weight loss")) {
    return "**For sustainable weight loss**: Create a **moderate calorie deficit (300-500 calories below maintenance)**, **prioritize protein intake (1.6-2g per kg body weight)**, combine **strength training with cardio**, get **7-9 hours of sleep**, and **stay hydrated**. Aim for **0.5-1kg loss per week** for healthy results.";
  }
  else if (lowerMsg.includes("muscle") || lowerMsg.includes("gain")) {
    return "**For muscle gain**: Consume a **slight calorie surplus (200-300 above maintenance)**, eat **1.6-2.2g protein per kg body weight**, focus on **progressive overload** in your training, get **adequate sleep (7-9 hours)**, and **stay consistent** with your workouts. **Compound exercises** like **squats, deadlifts, and bench press** are key!";
  }
  else {
    return "I'm here to help with your fitness journey! Feel free to ask about **workouts**, **nutrition**, **protein intake**, **weight loss**, or **muscle gain**. What specific aspect of fitness would you like to know more about?";
  }
};

const PRODUCT_TEMPLATE = (product) => {
  let productText = "\n\n**💪 Recommended Products**\n";
  productText += "**" + product.name + "**";

  if (product.brand) {
    productText += " **by** **" + product.brand + "**";
  }
  if (product.price) {
    productText += " **— ₹" + product.price.toLocaleString("en-IN") + "**";
  }
  if (product.rating) {
    productText += " **(⭐" + product.rating + "/5)**";
  }

  return productText;
};

module.exports = { PRODUCT_KEYWORDS, SYSTEM_PROMPT, getFallbackResponse, PRODUCT_TEMPLATE };