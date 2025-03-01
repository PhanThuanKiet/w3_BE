const GeminiService = require("../services/geminiService");
const GeminiRequest = require("../models/geminiRequest");
const GeminiResponse = require("../models/geminiResponse");

const askGemini = async (req, res) => {
  try {
    const { question } = req.body; // Loại bỏ userId
    if (!question) {
      return res.status(400).json({ success: false, message: "question là bắt buộc." });
    }

    const newRequest = await GeminiRequest.create({ question });
    const geminiAnswer = await GeminiService.generateText(question);
    const newResponse = await GeminiResponse.create({
      request: newRequest._id,
      response: geminiAnswer,
    });

    res.status(200).json({ success: true, data: newResponse });
  } catch (error) {
    console.error("Lỗi khi gọi API Gemini:", error?.response?.data || error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi gọi Gemini API." });
  }
};

module.exports = { askGemini };