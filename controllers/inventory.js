const { StatusCodes } = require("http-status-codes");
const Inventory = require("../models/inventory");
const User = require("../models/user");
const InventoryCounter = require("../models/inventorycounter");

const createProperty = async (req, res) => {
    try{
      const newInventory = new Inventory(req.body); 
      
      console.log("req body data ", newInventory);
      console.log("req files data ", req.file);

      // Save information about the uploaded images to the database
      const propertyImage = req.file.map(file => {
	console.log("file ", file);      
        return { filename: file.filename, imageURL: process.env.IMAGE_URL+file.filename };
      });
    
      const floorPlanImage = req.file.map(file => {
	      console.log("floor image", file);
        return { filename: file.filename, imageURL: process.env.IMAGE_URL+file.filename };
      });

      // Get the next sequence value
      const sequenceDocument = await InventoryCounter.findOneAndUpdate(
        { collectionName: 'Inventory' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      newInventory.id = sequenceDocument.seq;
      
      await newInventory.save();
      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Property details added successfully"})
     }catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).json({statusCode:StatusCodes.BAD_REQUEST,error})
	     
    }
};

const getPropertyList = async(req, res) => {
  Inventory.find()
  .then(async (invResult) => {
    //send response
    // let finalResponse = await formatImageURL(invResult);
    // console.log("final resp == ", finalResponse);
    res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, invResult});
  })
  .catch((err) => {
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error fetching inventory details",
      err,
    });
  });
};

const formatImageURL = (invResult) => {
  console.log("inside formatImage url");
  return new Promise((resolve, reject) => {
      // Loop through the propertyImage array and add the new key-value pair
    console.log("inside promise")
    invResult.forEach(item => {
      item.propertyImage = item.propertyImage.map(image => ({
        ...image,
        "imageURL":process.env.IMAGE_URL+image.filename
      }));
    })
    resolve(invResult);
  })
}

const propertyApproval = async(req, res) => {
  Inventory.findOneAndUpdate(
    { _id: req.body.id },
    { $set: { status: req.body.status } }
  )
  .then(async (invResult) => {
    if (invResult && invResult != null) {
      console.log(`user data check == ${invResult}`);
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK,
        message: `${invResult.propertyName} has been approve by Opertional Admin.`,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid details.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while providing approval to user",
      errMsg: err,
    });
  });
};

const getPropertyDetailById = async(req, res) => {
  Inventory.findOne({ _id: req.params.id }).select("-__v")
  .then(async (invResult) => {
    if (invResult && invResult != null) {
      console.log(`inventory data check == ${invResult}`);
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, invResult});
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid details.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while providing approval to user",
      errMsg: err,
    });
  });
};

const getPropertyTypeList = async(req, res) => {
  console.log("req.params.type:", req.params.ptype);
  Inventory.find({ propertyFor: req.params.ptype }).select("-__v")
  .then(async (invResult) => {
    console.log("invResult:", invResult);
    if (invResult && invResult != null) {
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, invResult});
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid details.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while providing approval to user",
      errMsg: err,
    });
  });
};

const getPropertyListRoleBased = async(req, res) => {
  Inventory.find({ uploaderEmail: req.params.email }).select("-__v")
  .then(async (invResult) => {
    console.log("invResult:", invResult);
    if (invResult && invResult != null) {
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, invResult});
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid details.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while providing approval to user",
      errMsg: err,
    });
  });
};

const getPropertyDetailByLocation = async(req, res) => {
  Inventory.find({ location: req.params.location}).select("-__v")
  .then(async (invResult) => {
    console.log("invResult:", invResult);
    if (invResult && invResult != null) {
      res.status(StatusCodes.OK).json({statusCode:StatusCodes.OK, invResult});
    } else {
      res.status(StatusCodes.NOT_FOUND).json({statusCode:StatusCodes.NOT_FOUND,
        message: "Please provide valid details.",
      });
    }
  })
  .catch((err) => {
    console.log("error == ", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode:StatusCodes.BAD_REQUEST,
      message: "Error while providing approval to user",
      errMsg: err,
    });
  });
}

module.exports = {
    createProperty, getPropertyList, propertyApproval,
    getPropertyDetailById, getPropertyTypeList, getPropertyListRoleBased, getPropertyDetailByLocation
};
