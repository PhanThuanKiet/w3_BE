const mongoose = require("mongoose");

const geminiResponseSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: "GeminiRequest", required: true }, // Liên kết với request đã gửi
    response: { type: String, required: true }, // Phản hồi từ Gemini
    createdAt: { type: Date, default: Date.now } // Thời gian lưu phản hồi
});

const GeminiResponse = mongoose.model("GeminiResponse", geminiResponseSchema);

module.exports = GeminiResponse;
