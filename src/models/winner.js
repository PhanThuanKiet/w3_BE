const mongoose = require('mongoose');

const winnerjobsSchema = new mongoose.Schema({
    bank: {
        type: String,
        unique: true, // Thêm chỉ mục duy nhất
        required: true
    }, // Ngân hàng hoặc nguồn công việc
    jobTitle: { type: String, required: true, trim: true }, // Chức danh công việc
    userAnswer: { type: String, required: true, trim: true }, // Câu trả lời của người dùng
    wallet: { type: String, required: true, trim: true }, // Số dư ví (kiểu chuỗi)
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('WinnerJob', winnerjobsSchema, 'winnerjobs');
