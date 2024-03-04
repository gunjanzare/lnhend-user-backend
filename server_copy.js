"use strict";

const express = require("express");
const logger = require("morgan");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const InitiateMongoServer = require("./db_connector/db");
const router = express.Router();

//https ssl certificate
const https=require('https');
const fs=require('fs');

// Routes
const authRouter = require("./routes/api/auth");
const inventoryRouter = require("./routes/api/inventory");
const subUserRouter = require("./routes/api/subuser");

const app = express();
// for body-parser middleware
app.use(express.json());
//cors middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// morgan logger for dev
app.use(logger("dev"));

// Set up our main routes
app.use("/api/users", authRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/subuser", subUserRouter);

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//GUI
app.use(express.static(process.cwd()+"/dashboard/build"));
app.get('/', (req,res) => {
  res.sendFile(process.cwd()+"/dashboard/build/index.html")
});

//to server all static files for images
app.use(express.static(process.cwd()+"/uploads"));
app.use('/uploads', express.static('uploads'));

// if the request passes all the middleware without a response
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  console.log("error", error);
  next(error);
});

// for general error handling
app.use((error, req, res, next) => {
  console.log("error", error);
  res.status(error.status || 500).json({
    message: error.response,
  });
});

// App's connection port
const PORT = process.env.PORT || 5000;

//ssl 
console.log("__dirname", __dirname);
const options={
  key: fs.readFileSync('/etc/letsencrypt/live/apps.landsandhomes.com/fullchain.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/apps.landsandhomes.com/privkey.pem')
}

const start = async () => {
  try {
    await InitiateMongoServer();
   /* app.listen(PORT, () => {
      console.log(`Server is connected on port ${PORT}`);
    });*/
    
    const sslServer=https.createServer(options,app);
    sslServer.listen(PORT,()=>{
	console.log(`Secure server is listening on port ${PORT}`)
    })
  } catch (error) {
    console.log("error =>", error);
  }
};

start();
