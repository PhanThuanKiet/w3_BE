const mongoose = require("mongoose");

const geminiRequestSchema = new mongoose.Schema({
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GeminiRequest = mongoose.model("GeminiRequest", geminiRequestSchema);
module.exports = GeminiRequest;