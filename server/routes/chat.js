// server/routes/chat.js
const express = require("express");
const { GoogleGenerativeAI, GoogleGenerativeAIFetchError } = require("@google/generative-ai");
const Product = require("../models/Product");
const router = express.Router();

// Debug: Check if API key is loaded
console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
console.log("API Key prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 15) + "..." : "MISSING");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables!");
  console.error("Please check your .env file and ensure it's loaded correctly.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini Config
const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ model: modelName });

const PRODUCT_KEYWORDS = ["protein", "supplement", "muscle", "gain", "whey", "creatine", "mass"];

const SYSTEM_PROMPT = `You are FitMart's expert fitness assistant.
Only answer questions related to: workouts, exercise routines, diet, nutrition, 
protein intake, weight loss, muscle gain, and supplements.
If the question is unrelated to fitness, politely redirect the user.
Keep answers concise, practical, and friendly. Use short paragraphs.
**Use bold text (surround important words with **) to highlight key information like numbers, recommendations, and important terms.**`;

// Enhanced fallback responses with bold formatting
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

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Processing chat message:", { length: message.length, timestamp: Date.now() });

    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}`;

    let reply;
    let usedFallback = false;

    try {
      console.log("Calling Gemini API...");
      const result = await model.generateContent(prompt);
      reply = result.response.text().trim();
      console.log("Gemini API response received");
    } catch (apiError) {
      console.error("Gemini API Error:", apiError.message);
      console.error("Error Status:", apiError.status);

      if (apiError.status === 429) {
        console.warn("⚠️ API quota exceeded, using fallback response");
        reply = getFallbackResponse(message);
        usedFallback = true;
      } else if (apiError.message?.includes("API key")) {
        console.error("❌ API key error - please verify your Gemini API key is valid");
        reply = "I'm having trouble connecting to my knowledge base. Please check if the **API key** is properly configured. In the meantime, I can still help with **general fitness advice**!";
        usedFallback = true;
      } else {
        throw apiError;
      }
    }

    // Product recommendation logic with bold formatting
    const lower = message.toLowerCase();
    const wantsProduct = PRODUCT_KEYWORDS.some(kw => lower.includes(kw));

    if (wantsProduct) {
      try {
        const product = await Product.findOne({
          $or: [
            { category: /nutrition/i },
            { name: /protein|supplement|whey|creatine/i },
          ],
        }).sort({ rating: -1 });

        if (product) {
          // Build product recommendation with bold formatting
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

          reply += productText;
        }
      } catch (productError) {
        console.error("Product lookup error:", productError);
        // Don't fail the whole request if product lookup fails
      }
    }

    // Add note if using fallback
    if (usedFallback) {
      reply += "\n\n*Note: Using enhanced knowledge base. For more detailed responses, ensure API key has available quota.*";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({
      error: "Failed to generate response",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;