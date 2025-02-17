const User = require("../models/user");
const Prediction = require("../models/prediction");
const Jobs=require("../models/job");
const WinnerJobs =require("../models/winner");

const createUserService = async (db, wallet, bank, mnemonic, btc) => {
    try {
        const collection = db.collection('users'); // Thay 'users' bằng tên collection của bạn

        // Kiểm tra xem người dùng với `bank` đã tồn tại hay chưa
        const existingUser = await collection.findOne({ bank });
        if (existingUser) {
            return { success: true, message: "Bank already exists.", data: existingUser };
        }

        // Sử dụng pipeline để chèn dữ liệu mới
        const pipeline = [
            {
                $match: { bank } // Match không tìm thấy tài liệu nào vì đã kiểm tra ở trên
            },
            {
                $merge: {
                    into: "users", // Collection đích
                    on: "_id", // Trường để xác định tài liệu duy nhất
                    whenMatched: "fail", // Không ghi đè nếu trùng lặp
                    whenNotMatched: "insert" // Chèn nếu không tìm thấy
                }
            }
        ];

        // Thực thi pipeline với dữ liệu mới
        const result = await collection.aggregate([
            {
                $unionWith: {
                    coll: "users",
                    pipeline: [
                        {
                            $replaceRoot: {
                                newRoot: {
                                    wallet,
                                    bank,
                                    mnemonic,
                                    btc
                                }
                            }
                        }
                    ]
                }
            },
            ...pipeline
        ]).toArray();

        // Trả về kết quả
        return { success: true, data: result[0] }; // `result[0]` chứa dữ liệu vừa được thêm vào
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Internal server error." };
    }
};


const createPredictionService = async (wallet, bank, btc, predictPrice, date) => {
    try {
        const pipeline = [
            // Stage 1: Match the document by 'bank'
            { $match: { bank } },

            // Stage 2: Update fields using $set
            {
                $set: {
                    wallet,
                    btc,
                    predictPrice,
                    date
                }
            },

            // Stage 3: Perform upsert using $merge
            {
                $merge: {
                    into: "predictions", // Collection name
                    on: "_id",          // Merge based on _id
                    whenMatched: "merge", // Merge fields if document exists
                    whenNotMatched: "insert" // Insert new document if not found
                }
            }
        ];

        // Execute the aggregation pipeline
        const result = await Prediction.aggregate(pipeline);

        // Return success response
        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating or updating prediction:", error);
        return { success: false, message: error.message || "Internal server error." };
    }
};
const createWinnerService = async (bank, jobTitle, userAnswer, wallet) => {
    try {
        console.log("Received data:", { bank, jobTitle, userAnswer, wallet }); // Kiểm tra dữ liệu nhận được

        // Sử dụng Aggregation Pipeline để kiểm tra và cập nhật/chèn dữ liệu
        const result = await WinnerJobs.aggregate([
            // Stage 1: Kiểm tra xem có tài liệu nào tồn tại với trường `bank` không
            {
                $match: { bank }
            },
            // Stage 2: Nếu không tìm thấy tài liệu nào, thêm một tài liệu mới
            {
                $merge: {
                    into: "winnerjobs", // Tên collection
                    on: "bank",         // Trường để xác định tài liệu
                    whenMatched: "merge", // Cập nhật tài liệu nếu đã tồn tại
                    whenNotMatched: "insert" // Chèn mới nếu không tồn tại
                }
            }
        ]);

        // Nếu không có tài liệu nào được trả về từ pipeline, tạo mới tài liệu
        if (!result || result.length === 0) {
            const newDocument = await WinnerJobs.create({ bank, jobTitle, userAnswer, wallet });
            return { success: true, data: newDocument };
        }

        // Trả về kết quả thành công
        return { success: true, data: result[0] };
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
        // Sử dụng MongoDB Aggregation Pipeline để lấy toàn bộ dữ liệu từ collection jobs
        const pipeline = [
            // Stage 1: Match tất cả các document (tương đương với find({}))
            { $match: {} },
            // Stage 2: Project tất cả các trường (không cần thiết nếu muốn lấy tất cả thuộc tính)
            // Nếu muốn giữ nguyên tất cả thuộc tính, có thể bỏ qua stage này
            { $project: { _id: 1, __v: 0 } } // Ví dụ: Loại bỏ trường __v
        ];

        const results = await Jobs.aggregate(pipeline);

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