const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Sheet",
        required: true,
    },
    solvedQuestions:[
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
            }
        }
    ]
},{timestamps:true});

const UserProgress = mongoose.model("UserProgress",userProgressSchema);

module.exports = UserProgress;