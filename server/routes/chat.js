// server/routes/chat.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const { PRODUCT_KEYWORDS, SYSTEM_PROMPT, getFallbackResponse, PRODUCT_TEMPLATE } = require("../config/chatConfig");
const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
console.log("API Key prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 15) + "..." : "MISSING");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables!");
  console.error("Please check your .env file and ensure it's loaded correctly.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ model: modelName });

router.post("/", chatLimiter, async (req, res) => {
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
          reply += PRODUCT_TEMPLATE(product);
        }
      } catch (productError) {
        console.error("Product lookup error:", productError);
      }
    }

    if (usedFallback) {
      reply += "\n\n*Note: Using enhanced knowledge base. For more detailed responses, ensure API key has available quota.*";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({
      error: "Failed to generate response",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;