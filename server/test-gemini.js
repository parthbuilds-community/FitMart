// server/test-gemini.js
/* eslint-disable no-console */
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ No API key found in environment variables!");
    
    return;
  }

  console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Gemini Config
  const modelName = process.env.GEMINI_MODEL_NAME
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
  
    const result = await model.generateContent("Say 'API is working!' in 3 words");
    await result.response;
    
    return true;
  } catch (error) {
    console.error("❌ API Error:", error.message);
    if (error.status === 429) {
      console.error("Quota exceeded. Check your usage at: https://ai.dev/rate-limit");
    }
    if (error.message?.includes("API key")) {
      console.error("Invalid API key. Please check your key at: https://makersuite.google.com/app/apikey");
    }
    return false;
  }
}

testGeminiAPI();