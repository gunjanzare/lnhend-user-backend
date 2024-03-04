const express = require("express");
const router = express.Router();
const { isRequestValidated, validateSignUpRequest,
     validateSignIpRequest } = require("../../middleware/validators");
const {signUp, signIn, generateSaveOTP, loginWithOTP, getUserList, getUserDetails} = require("../../controllers/auth");

// @route   POST api/users/signup
// @desc    send user data for registration
// @access  public
router.post("/signup", validateSignUpRequest, isRequestValidated, signUp);

// @route   POST api/users/login
// @desc    send user data for logging in
// @access  public
router.post("/login", signIn);

// @route   GET api/users/verify/:emailphone
// @desc    verify email or phone and sending OTP to user
// @access  private
router.get("/verify/:emailphone", generateSaveOTP);

// @route   POST api/users/verifyotp
// @desc    Login using OTP
// @access  private
router.post("/verifyotp", loginWithOTP);

// @route   get api/users/list
// @desc    Get user lists
// @access  private
router.get("/list", getUserList);

// @route   get api/users//userdetails/:email
// @desc    Get user details
// @access  private
router.get("/userdetails/:_id", getUserDetails);

module.exports = router;

