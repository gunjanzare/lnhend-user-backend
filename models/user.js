const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  id:{
    type:Number
  },
  userName: {
    type: String,
    require: true,
    trim: true,
    min: 3,
    max: 100,
  },
  email: {
     type: String,
     require: true,
     trim: true,
     unique: true,
     lowercase: true,
  },
  mobile: {
    type: String,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
    trim: true,
    min: 3,
    max: 100,
  },
  location: {
    type: String,
  },
  otp: {
    type: String
  },
  role:{
    type: String
  },
  gstEmail:{
    type:String
  },
  gstNo:{
    type:String
  },
  empId:{
    type:String
  },
  subUser:[{
    username:{
      type: String, 
    },
    userMobile:{
      type: String,
    },
    userEmpId:{
      type: String,
    },
    userEmailId:{
      type: String,
    },
    userRole:{
      type:String
    }
  }],
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema);
