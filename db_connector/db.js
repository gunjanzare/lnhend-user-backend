const mongoose = require("mongoose");
require("dotenv").config();
// Replace this with your MONGOURI.
const MONGOURI = process.env.MONGODB_URL;
console.log(`checking mongo uri ${MONGOURI}`);

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI);
    console.log("Database connected successfully...");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;