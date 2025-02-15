const express = require('express');
const { createWallet, createPrediction,createJobsWinner, getPrediction,getJob } = require('../controllers/userController');

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api");
});
//API liên quan đến tạo và dự đoán
routerAPI.post("/createwallet", createWallet);
routerAPI.post("/createprediction", createPrediction);
routerAPI.post("/createwinner", createJobsWinner);
//API liên quan đến tìm ra winner 
routerAPI.get("/winner",getPrediction);
routerAPI.get("/getjob",getJob);
module.exports = routerAPI; // CommonJS export
