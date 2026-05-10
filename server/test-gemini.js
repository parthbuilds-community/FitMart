// server/test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  console.log("Testing Gemini API...");
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ No API key found in environment variables!");
    console.log("Please create a .env file with: GEMINI_API_KEY=your_key_here");
    return;
  }

  console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Gemini Config
  const modelName = process.env.GEMINI_MODEL_NAME
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    console.log("Sending test request...");
    const result = await model.generateContent("Say 'API is working!' in 3 words");
    const response = await result.response;
    console.log("✅ Success! Response:", response.text());
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