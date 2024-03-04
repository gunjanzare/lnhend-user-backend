const express = require("express");
const router = express.Router();
const {createProperty, getPropertyList, propertyApproval, getPropertyDetailById,
    getPropertyTypeList, getPropertyListRoleBased, getPropertyDetailByLocation} = require("../../controllers/inventory");
//const upload = require("../../middleware/upload");
const multer = require('multer');
const InventoryCounter = require("../../models/inventorycounter");
const { StatusCodes } = require("http-status-codes");
const Inventory = require("../../models/inventory");

// Create an array to store file paths
const imagePath = [];

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    // Push the file path to the imagePath array
    imagePath.push({
      filename: fileName
    });
    // Pass the generated file name to the callback
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });

// @route   POST api/inventory/createproperty
// @desc    save data for property
// @access  public
router.post("/createproperty", upload.array('images', 9), async(req, res) => {
try{
        console.log("image path - ", imagePath);
        const newInventory = new Inventory(req.body);
  
        // Save information about the uploaded images to the database
        const propertyImage = imagePath.map(file => {
          return { filename: file.filename, imageURL: process.env.IMAGE_URL+file.filename };
        });
        const floorPlanImage = imagePath.map(file => {
          return { filename: file.filename, imageURL: process.env.IMAGE_URL+file.filename };
        });
        newInventory.propertyImage = propertyImage;
        newInventory.floorPlanImage = floorPlanImage;
        newInventory.status = 'pending';

        // Get the next sequence value
        const sequenceDocument = await InventoryCounter.findOneAndUpdate(
          { collectionName: 'Inventory' },
          { $inc: { seq: 1 } },
          { upsert: true, returnDocument: 'after' }
        );  
        newInventory.id = sequenceDocument.seq;
        console.log("req body date ", newInventory);
        
        await newInventory.save();
        res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          message: "Property details added successfully"})
       }catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,err})
    }
});

// @route   GET api/inventory/list
// @desc    list of property data fetching from mongoDB
// @access  public
router.get("/list", getPropertyList);

// @route   GET api/propertylist/:ptype
// @desc    list of property data fetching from mongoDB based on type
// @access  public
router.get("/propertylist/:ptype", getPropertyTypeList);

// @route   GET api/rolelist/:email
// @desc    list of property data fetching from mongoDB based on role
// @access  public
router.get("/rolelist/:email", getPropertyListRoleBased);

// @route   put api/inventory/approval
// @desc    Approve property by opertional admin
// @access  private
router.put("/approval", propertyApproval);

// @route   get api/inventory/:id
// @desc    get property details by id
// @access  private
router.get("/details/:id", getPropertyDetailById);

// @route   get api/invLocation/:location
// @desc    get property details based on location selected or filter
// @access  private
router.get("/invLocation/:location", getPropertyDetailByLocation);


module.exports = router;
