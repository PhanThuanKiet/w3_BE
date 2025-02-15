const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    wallet: { type: String },
    bank: { type: String ,unique:true},
    mnemonic: { type: String },
    btc: { type: Number }
},{versionKey:false});
const User = mongoose.model('user', userSchema);

module.exports = User;
