const express = require("express");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Product = require("../models/Product");
const {
  PRODUCT_KEYWORDS,
  SYSTEM_PROMPT,
  getFallbackResponse,
  PRODUCT_TEMPLATE,
} = require("../config/chatConfig");

const router = express.Router();

/* ---------------- RATE LIMIT ---------------- */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});

/* ---------------- GEMINI INIT ---------------- */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash",
});

/* ---------------- ROUTE ---------------- */
router.post("/", chatLimiter, async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({
      error: "Message is required",
      errorCode: "EMPTY_MESSAGE",
    });
  }

  console.log("💬 Chat request:", {
    length: message.length,
    time: new Date().toISOString(),
  });

  const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}`;

  let reply = "";
  let aiUnavailable = false;

  /* ---------------- GEMINI CALL ---------------- */
  try {
    console.log("Calling Gemini...");

    const result = await model.generateContent(prompt);
    reply = result.response.text().trim();

    console.log("Gemini response received");
  } catch (err) {
    console.error("Gemini Error:", err?.message || err);

    aiUnavailable = true;

    // quota exceeded
    if (err?.status === 429) {
      reply = getFallbackResponse(message);
    }
    // API key issue
    else if (err?.message?.toLowerCase().includes("api key")) {
      reply =
        "AI service configuration issue detected. Please try again later.";
    }
    // generic failure
    else {
      reply =
        "Our AI trainer is temporarily unavailable. Please try again later.";
    }
  }

  /* ---------------- PRODUCT ENRICHMENT ---------------- */
  const lower = message.toLowerCase();
  const wantsProduct = PRODUCT_KEYWORDS.some((kw) =>
    lower.includes(kw.toLowerCase())
  );

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
    } catch (productErr) {
      console.error("Product lookup failed:", productErr.message);
    }
  }

  /* ---------------- FINAL RESPONSE ---------------- */

  // IMPORTANT: frontend-safe contract
  if (aiUnavailable) {
    return res.status(503).json({
      reply,
      errorCode: "GEMINI_UNAVAILABLE",
      fallback: true,
    });
  }

  return res.status(200).json({
    reply,
    fallback: false,
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
router.use((err, req, res, next) => {
  console.error("Chat Route Fatal Error:", err);

  return res.status(500).json({
    error: "Internal server error",
    errorCode: "CHAT_ROUTE_FAILURE",
  });
});

module.exports = router;
