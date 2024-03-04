const express = require("express");
const router = express.Router();
const {createSubUser, getSubUserList} = require("../../controllers/subuser");

// @route   POST api/subusers/createuser
// @desc    send user data to create new sub user 
// @access  public
router.post("/createuser", createSubUser);
router.get("/list/:email", getSubUserList);

module.exports = router;
