const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const UserCounter = require("../models/usercounter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {otpGen, customOtpGen } = require('otp-gen-agent');
const axios = require('axios');
const qs = require('qs');

const saltRounds = process.env.SALT;


const signUp = async (req, res) => {
  try {
    const {userName, email, mobile, password, confirmPassword} = req.body;
    if (!userName || !email || !mobile || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please Provide Required Information",
      });
    }
    console.log(req.body)
    if(password == confirmPassword){
      const userData = req.body;
      const hashPassword = await genHashPassword(req.body.password);
      userData.password = hashPassword;
      
      // Get the next sequence value
      const sequenceDocument = await UserCounter.findOneAndUpdate(
        { collectionName: 'User' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      userData.id = sequenceDocument.seq
      console.log("req body == ", userData);
      const user = await User.findOne({ email: userData .email });
      if (user) {
        return res.status(StatusCodes.CONFLICT).json({
          statusCode: StatusCodes.CONFLICT,
          message: "User already registered",
        });
      } else {
          User.create(userData)
          .then(async (data, err) => {
              if (err) {
                res.status(StatusCodes.BAD_REQUEST).json({statusCode: StatusCodes.BAD_REQUEST, err });
              }
              else {
                  console.log(`user data == ${data}`);
                  return res.json({
                    statusCode: StatusCodes.CREATED,
                    message: "A new User created Successfully" 
                  });
              }
          }).catch((err) => {
            console.log("error ", JSON.stringify(err));
            res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,err})
          });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Password and confirm password mismatch. Please provide correct password",
      });
    }
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,err});
  }
};

const signIn = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    // Check if either email or phone is provided
    if (!email && !mobile) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Please provide either email or phone for login.",
      });
    }

    let user;

    // Check if email is provided
    if (email) {
      user = await User.findOne({ email }).select('-otp');
    }

    // Check if phone is provided
    if (mobile) {
      user = await User.findOne({ mobile }).select('-otp');
    }

    if (user) {
      bcrypt
        .compare(password, user.password)
        .then((userRes) => {
          if (userRes) {
            // delete user['password'];
            user.password=undefined;
            // Create a new object without the 'password' key
            res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK,user});
          } else {
            res.status(StatusCodes.UNAUTHORIZED).json({
              statusCode:StatusCodes.UNAUTHORIZED,
              message: "Unauthorized user! Please correct UserId and Password.",
            });
          }
        })
        .catch((err) =>{ console.log(`error == ${JSON.stringify(err)}`)
          res.status(StatusCodes.BAD_REQUEST).json({
            statusCode:StatusCodes.BAD_REQUEST, msg:err.message})
        });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ statusCode:StatusCodes.NOT_FOUND,
        message: "email not match. Please provide valid email.",
      });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST, error });
  }
};

const generateSaveOTP = async (req, res) => {
  // Define the filter to find the document based on email or mobile number
  const filter = {
    $or: [
      { email: req.params.emailphone  }, // Replace with the email you want to search for
      { mobile: req.params.emailphone  },     // Replace with the mobile number you want to search for
    ],
  };

  // Define the update operation
  const update = {
    $set: {
      otp: await generateOTP(),
    },
  };
  await User.findOneAndUpdate(filter, update)
  .then(async (user) => {
    if (user && user != null) {
      console.log('user data check ==', JSON.stringify(user));

      let ePhone = req.params.emailphone;
      console.info("Mail send status ", ePhone);
      await sendSMSOTP(ePhone);
      
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK,
        message: `OTP has been sent to your phone${req.params.emailphone}. Please check SMS.`,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid email or mobile.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while sending OTP",
      errMsg: err,
    });
  });
};

const loginWithOTP = async (req, res) => {
  console.log('inside', JSON.stringify(req.body));
  try {
    const { email, mobile, otp } = req.body;
    // Check if either email or phone is provided
    if (!email && !mobile) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Please provide either email or phone for login.",
      });
    }

    let user;

    // Check if email is provided
    if (email) {
      user = await User.findOne({ email, otp }).select('-otp').select('-password');
    }

    // Check if phone is provided
    if (mobile) {
      user = await User.findOne({ mobile, otp }).select('-otp').select('-password');
    }

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode:StatusCodes.UNAUTHORIZED,
        message: "Invalid OTP! Please correct OTP.",
      });
    }else {
      res.status(StatusCodes.OK).json({ statusCode:StatusCodes.OK, user});
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST, error });
  } 
};


const getUserList = async (req, res) => {
  console.log("inside");
  User.find()
    .select("-password")
    .select("-otp")
    .select("-createdAt")
    .select("-updatedAt")
    .select("-__v")
    .then((usersResult) => {
      res.status(StatusCodes.OK).json({
        statusCode:StatusCodes.OK,usersResult});
    })
    .catch((err) => {
      console.log(err);
      res.status(StatusCodes.BAD_REQUEST).json({
        statusCode:StatusCodes.BAD_REQUEST,
        message: "Error fetching user list",
        err,
      });
    });
};

const getUserDetails = async (req, res) => {
  try{
    let userDetails = await checkEmail(req.params);
    console.log(userDetails);
    if (userDetails || userDetails != null) {
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK,userDetails});
    } else {
      res.status(StatusCodes.NO_CONTENT).json({ statusCode:StatusCodes.NO_CONTENT,message: "No Record found" });
    }
  } catch(err) {
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error fetching user details",
      err,
    });
  }
};

function checkEmail(reqParams) {
  return User.findOne({ _id: reqParams._id })
    .select("-password")
    .then((user) => {
      return user;
    })
    .catch((err) => {
      return err;
    });
}

// Generate a random OTP
const generateOTP = () => customOtpGen({length: 4});

//Generate hash password
async function genHashPassword(password) {
  console.log(`password -- ${password} --- salt -- ${saltRounds}`);
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(password, Number(saltRounds))
      .then((hash) => {
        resolve(hash);
      })
      .catch((err) => reject(err.message));
  });
};

async function sendSMSOTP(ePhone) {
  return new Promise(async(resolve, reject) => {
    let userDetails = await User.findOne({mobile: ePhone}).select('-password');
    let data = qs.stringify({
      'method': 'sendMessage',
      'send_to': userDetails.mobile,
      'msg': `Your OTP to login to LandsNHomes is ${userDetails.otp}`,
      'msg_type': 'TEXT',
      'userid': '2000236562',
      'auth_scheme': 'PLAIN',
      'password': '0Ab50G0iP',
      'format': 'JSON'
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://enterprise.smsgupshup.com/GatewayAPI/rest',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      resolve(response.data);
    })
    .catch((error) => {
      reject(error);
    });
  })
}

module.exports = {
  signUp,  signIn,  generateSaveOTP, loginWithOTP, getUserList, getUserDetails
};
