const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const generateText = async (prompt) => {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set in .env");
    throw new Error("GEMINI_API_KEY không được cấu hình trong .env");
  }

  try {
    console.log("Sending request to Gemini API:", { prompt });
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    console.log("Gemini API response:", response.data);
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No valid response from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error; // Ném lỗi để controller xử lý
  }
};

module.exports = { generateText };