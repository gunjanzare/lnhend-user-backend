const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const inventorySchema = new Schema({
   propertyImage:[{
        filename:{
            type: String, //1,png
        },
        imageURL:{ //upload/1.png
            type: String,
        },
    }],
    floorPlanImage:[{
        filename:{
            type: String, //1,png
        },
        imageURL:{ //upload/1.png
            type: String,
        },
    }],
    propertyView:[{
        userEmail:{type:String},
        userName:{type:String},
        userMobile:{type:String},
    }],
    propertyInterested:[{
        userEmail:{type:String},
        userName:{type:String},
        userMobile:{type:String},
    }],
    propertyShortListed:[{
        userEmail:{type:String},
        userName:{type:String},
        userMobile:{type:String},
    }],
    pStatus:{
        type:String, 
        default: 'pending'
    },
    amenties:[{
        type:String
    }],
},{strict:false, timestamps: true })
module.exports = mongoose.model("Inventory", inventorySchema);
