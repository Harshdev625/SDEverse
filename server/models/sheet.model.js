const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema({
    title : {
        type:String,
        required:true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty:{
        type:String,
        enum : ["Easy","Medium","Hard"],
        default: "Medium",
        required: true,
    },
    platform:{
        type:String
    },
    questions:[
        {
            title:{
                type:String,
                required:true,
            },
            difficulty:{
                type:String,
                enum : ["Easy","Medium","Hard"],
                required:true
            },
            platformLink:{
                type:String,
            },
        }
    ],
},{timestamps:true});

const Sheet = mongoose.model("Sheet",sheetSchema);

module.exports = Sheet;