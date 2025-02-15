const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    wallet: { type: String, required: true, trim: true },
    bank: { type: String, required: true, trim: true },
    btc: { type: Number, required: true, min: 0 },
    predictPrice: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now }  // Thêm ngày hiện tại
}, { versionKey: false });

module.exports = mongoose.model('Prediction', predictionSchema);
