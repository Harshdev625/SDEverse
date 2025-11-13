const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const commentSchema = new mongoose.Schema(
  {
    parentType: {
      type: String,
      enum: ["Algorithm", "Proposal","DataStructure","DataStructureProposal","Blog"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    parentSlug: {
      type: String,
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    codeRef: { type: String },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
