const multer = require("multer");
const path = require("path");

let filePath = path.join(__dirname, "../");
console.log("file path ", filePath);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log("file name ", file);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadFile = multer({ storage: storage });

module.exports = uploadFile;
