const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const SubUser = require("../models/subuser");
const SubUserCounter = require("../models/subusercounter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {otpGen, customOtpGen } = require('otp-gen-agent');
const saltRounds = process.env.SALT;

const createSubUser = async(req, res) => {
    try{
        const subUserData = req.body;
        const hashPassword = await genHashPassword(req.body.userPassword);
        subUserData.userPassword = hashPassword;
        
        // Get the next sequence value
        const sequenceDocument = await SubUserCounter.findOneAndUpdate(
          { collectionName: 'SubUser' },
          { $inc: { seq: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
        subUserData.id = sequenceDocument.seq
        const subUser = await SubUser.findOne({ userEmailId: subUserData.userEmailId });

        // const subUserUpdate = await updateUserRecords(req.body);
        
        if (subUser) {
            return res.status(StatusCodes.CONFLICT).json({
              statusCode: StatusCodes.CONFLICT,
              message: "Sub User already registered",
            });
        } else {
            SubUser.create(subUserData)
            .then(async (data, err) => {
                if (err) {
                    res.status(StatusCodes.BAD_REQUEST).json({statusCode: StatusCodes.BAD_REQUEST, err });
                }
                else {
                    console.log(`user data == ${data}`);
                    const subUserUpdate = await updateUserRecords(req.body);
                    return res.json({
                        statusCode: StatusCodes.CREATED,
                        message: "A new Sub User created by Agent" 
                    });
                }
            }).catch((err) => {
                console.log("error ", JSON.stringify(err));
                res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,err})
            });
        }
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,err});
    }  
};

async function updateUserRecords(reqBody) {
    console.log("inside update user records");
    return new Promise((resolve, reject) => {
        const update = {
            $push: {
              subUser: {
                username: reqBody.userSName,
                userMobile: reqBody.userMobile,
                userEmpId: reqBody.userEmpId,
                userEmailId: reqBody.userEmailId,
                userRole: reqBody.userRole
              }
            }
        }

        User.findOneAndUpdate({email: reqBody.creatorEmail}, update, { new: true })
        .then(async (subUser) => {
            resolve(subUser);
        })
        .catch((err) => {
            reject(err);
        });
    })
}

const getSubUserList = async (req, res) => {
    SubUser.find({ creatorEmail: req.params.email }).select("-__v")
    .then(async (subUserResp) => {
        console.log("subUserResp:", subUserResp);
        if (subUserResp && subUserResp != null) {
          res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, subUserResp});
        } else {
          res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
            message: "Please provide valid details.",
          });
        }
    }).catch((err) => {
        console.log("error == ", err);
        res.status(StatusCodes.BAD_REQUEST).json({
          statusCode:StatusCodes.BAD_REQUEST,
          message: "Error while providing approval to user",
          errMsg: err,
        });
    });
}

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

module.exports = {
    createSubUser, getSubUserList
}
