const mongoose = require("mongoose");

const sheetProposalSchema = new mongoose.Schema({
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
    proposedChanges:{
        type:String,
        required: true,
    },
    status:{
        type:String,
        enum: ["Pending","Accepted","Rejected"],
        default:"Pending"
    },
},{timestamps:true});

const SheetProposal = mongoose.model("SheetProposal",sheetProposalSchema);

module.exports = SheetProposal;