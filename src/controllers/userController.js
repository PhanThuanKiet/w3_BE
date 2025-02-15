const { createUserService, createPredictionService,createWinnerService,getPredictionService,getJobService } = require("../services/userService");
const User = require("../models/user");
//post dữ liệu
const createWallet =async(req,res)=>{
    const {wallet,bank,mnemonic,btc}=req.body;
    const existingUser = await User.findOne({bank});
    if (existingUser){
        return res.status(400).json({ message: "Tài khoản ngân hàng đã được sử dụng" });
    }
    const data= await createUserService(wallet,bank,mnemonic,btc);
    return res.status(200).json(data)
}

const createPrediction= async(req,res)=>{
    const{wallet,bank,btc,predictPrice,date}=req.body;
    const data=await createPredictionService(wallet,bank,btc,predictPrice,date);
    return res.status(200).json(data)
}
const createJobsWinner = async (req, res) => {
    try {
        const { wallet, bank, jobTitle, userAnswer } = req.body;

        // Gọi service để tạo hoặc cập nhật công việc
        const result = await createWinnerService(bank, jobTitle, userAnswer, wallet);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error.", 
            error: error.message 
        });
    }
};

//get dữ liệu
const getPrediction = async (req, res) => {
    try {
        const { wallet, bank, btc, predictPrice, date } = req.query;
        
        const result = await getPredictionService(wallet, bank, btc, predictPrice, date);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error fetching predictions:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
const getJob = async (req, res) => {
    try {
        const result = await getJobService(); 
        
        return res.status(200).json(result); 
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu câu hỏi:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
};


module.exports = {
    createWallet,
    createPrediction,
    createJobsWinner,
    getPrediction,
    getJob,
}