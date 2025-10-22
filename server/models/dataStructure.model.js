const mongoose = require("mongoose");
const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const codeSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const implementationSchema = new mongoose.Schema(
  {
    codeDetails: { type: codeSchema, required: true },
    explanation: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
  },
  { _id: false }
);

const operationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
    implementations: [implementationSchema],
  },
  { _id: false }
);

const dataStructureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },

    definition: { type: String, required: true, trim: true },
    category: {
      type: [String],
      enum: DATA_STRUCTURE,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: ["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"],
      required: true,
    },
    characteristics: { type: String, required: true },
    visualization: { type: String },

    operations: [operationSchema],

    fullImplementations: [codeSchema],

    applications: [
      {
        domain: { type: String, required: true },
        examples: [{ type: String }],
      },
    ],

    comparisons: [
      {
        with: { type: String, required: true },
        advantages: [{ type: String }],
        disadvantages: [{ type: String }],
        whenToUse: { type: String },
      },
    ],

    tags: [{ type: String, trim: true, index: true }],
    references: [{ type: String }],
    videoLinks: [{ type: String }],

    contributors: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        contributionType: {
          type: String,
          enum: ["create", "edit", "content", "code", "review", "other"],
          required: true,
        },
        contributedAt: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

dataStructureSchema.index({
  title: "text",
  definition: "text",
  characteristics: "text",
  tags: "text",
});
dataStructureSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model("DataStructure", dataStructureSchema);
