const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const inventoryCounterSchema = new Schema({},{strict:false});

module.exports = mongoose.model("InventoryCounter", inventoryCounterSchema);
