const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const subUserSchema = new mongoose.Schema({
  id:{
    type:Number
  },
  userSName: {
    type: String,
    require: true,
    trim: true,
    min: 3,
    max: 100,
  },
  creatorEmail: {
    type: String,
    require: true,
    trim: true,
    lowercase: true,
  },
  userMobile: {
    type: String,
    trim: true,
    unique: true
  },
  userEmailId: {
    type: String,
    trim: true,
    unique: true
  },
  userPassword: {
    type: String,
    require: true,
    trim: true,
    min: 3,
    max: 100,
  },
  userOTP: {
    type: String
  },
  userRole:{
    type: String
  },
  userEmpId:{
    type:String
  },
},{ timestamps: true });

module.exports = mongoose.model("SubUser", subUserSchema);
