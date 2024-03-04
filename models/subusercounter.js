const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subUserCounterSchema = new Schema({},{strict:false});

module.exports = mongoose.model("SubUserCounter", subUserCounterSchema);
