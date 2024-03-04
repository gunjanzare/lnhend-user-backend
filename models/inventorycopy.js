const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const inventorySchema = new Schema({
    id:{
        type:Number
    },
    propertyName:{
        type:String
    },
    location:{
        type:String
    },
    block: {type:String},
    totalFloor: {type:String},
    floor: {type:String},    
    areaDetails:{
        type:String
    },
    price:{
        type:String
    },
    propertyStatus:{
        type:String
    },
    propertyAge:{
        type:String
    },
    room:{
        type:String
    },
    bhk:{
        type:String
    },
    serventRoom: {type:String},
    poojaRoom: {type:String},
    propertyFace:{
        type:String
    },
    parking:{
        type:String
    },
    amenties:[{
        type:String
    }],
    furnishingStatus:{
        type:String
    },
    preferredTenant:{
        type:String
    },
    preferredMeal:{
        type:String
    },
    address:{
        type:String
    },    
    status:{
        type:String, 
        default: 'pending'
    },
    propertyType:{
        type:String
    },
    type:{
        type: String
    },
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
    uploaderEmail:{
        type:String
    }, 
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
    }]
},{ timestamps: true })
module.exports = mongoose.model("Inventory", inventorySchema);
