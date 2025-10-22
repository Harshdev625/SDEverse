const asyncHandler = require("express-async-handler");
const DataStructure = require("../models/dataStructure.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const createDataStructure = asyncHandler(async (req, res) => {
  const {
    title,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
  } = req.body;

  if (!title || !definition || !type || !characteristics) {
    return res.status(400).json({
      message:
        "Missing required fields: title, definition, type, characteristics.",
    });
  }

  if (!Array.isArray(category) || category.length === 0) {
    return res
      .status(400)
      .json({ message: "Category must be a non-empty array." });
  }

  const invalidCategories = category.filter(
    (cat) => !DATA_STRUCTURE.includes(cat)
  );
  if (invalidCategories.length > 0) {
    return res
      .status(400)
      .json({ message: `Invalid categories: ${invalidCategories.join(", ")}` });
  }

  const allowedTypes = [
    "Linear",
    "Non-Linear",
    "Hierarchical",
    "Graph",
    "Other",
  ];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      message: `Invalid type: ${type}. Must be one of ${allowedTypes.join(
        ", "
      )}.`,
    });
  }

  const slug = await generateUniqueSlug(title);

  const dataStructure = new DataStructure({
    title,
    slug,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    createdBy: req.user._id,
    isPublished: true,
    publishedAt: new Date(),
    publishedBy: req.user._id,

    contributors: [
      {
        user: req.user._id,
        contributionType: "create",
        description: "Initial creation of data structure",
      },
    ],
  });

  const createdDataStructure = await dataStructure.save();

  const users = await User.find({}, "_id").lean();
  const notifications = users.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type: "new_data_structure",
    message: `A new data structure "${title}" has been added.`,
    link: `/data-structures/${slug}`,
    read: false,
  }));
  await Notification.insertMany(notifications);

  res.status(201).json(createdDataStructure);
});

const updateDataStructure = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  if (
    dataStructure.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this data structure.");
  }

  const {
    title,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    status,
    isVerified,
    isPublished,
  } = req.body;

  const changes = [];
  let contributionType = "edit";

  const hasArrayChanged = (oldArray, newArray) => {
    if (!newArray) return false;
    if (oldArray.length !== newArray.length) return true;
    for (let i = 0; i < oldArray.length; i++) {
      if (JSON.stringify(oldArray[i]) !== JSON.stringify(newArray[i])) {
        return true;
      }
    }
    return false;
  };

  if (title !== undefined && title !== dataStructure.title) {
    changes.push("title");
    dataStructure.title = title;
  }
  if (definition !== undefined && definition !== dataStructure.definition) {
    changes.push("definition");
    dataStructure.definition = definition;
  }
  if (
    characteristics !== undefined &&
    characteristics !== dataStructure.characteristics
  ) {
    changes.push("characteristics");
    dataStructure.characteristics = characteristics;
  }
  if (
    visualization !== undefined &&
    visualization !== dataStructure.visualization
  ) {
    changes.push("visualization");
    dataStructure.visualization = visualization;
  }

  if (category !== undefined) {
    if (!Array.isArray(category) || category.length === 0) {
      res.status(400);
      throw new Error("Category must be a non-empty array.");
    }
    const invalidCategories = category.filter(
      (cat) => !DATA_STRUCTURE.includes(cat)
    );
    if (invalidCategories.length > 0) {
      res.status(400);
      throw new Error(`Invalid categories: ${invalidCategories.join(", ")}`);
    }
    if (hasArrayChanged(dataStructure.category, category)) {
      changes.push("shruti");
      dataStructure.category = category;
    }
  }

  if (type !== undefined) {
    const allowedTypes = [
      "Linear",
      "Non-Linear",
      "Hierarchical",
      "Graph",
      "Other",
    ];
    if (!allowedTypes.includes(type)) {
      res.status(400);
      throw new Error(
        `Invalid type: ${type}. Must be one of ${allowedTypes.join(", ")}.`
      );
    }
    if (型的 !== dataStructure.type) {
      changes.push("type");
      dataStructure.type = type;
    }
  }

  if (
    operations !== undefined &&
    hasArrayChanged(dataStructure.operations, operations)
  ) {
    changes.push("operations");
    dataStructure.operations = operations;
    if (contributionType === "edit") contributionType = "content";
  }
  if (
    fullImplementations !== undefined &&
    hasArrayChanged(dataStructure.fullImplementations, fullImplementations)
  ) {
    changes.push("fullImplementations");
    dataStructure.fullImplementations = fullImplementations;
    if (contributionType === "edit" || contributionType === "content")
      contributionType = "code";
  }
  if (
    applications !== undefined &&
    hasArrayChanged(dataStructure.applications, applications)
  ) {
    changes.push("applications");
    dataStructure.applications = applications;
  }
  if (
    comparisons !== undefined &&
    hasArrayChanged(dataStructure.comparisons, comparisons)
  ) {
    changes.push("comparisons");
    dataStructure.comparisons = comparisons;
  }
  if (tags !== undefined && hasArrayChanged(dataStructure.tags, tags)) {
    changes.push("tags");
    dataStructure.tags = tags;
  }
  if (
    references !== undefined &&
    hasArrayChanged(dataStructure.references, references)
  ) {
    changes.push("references");
    dataStructure.references = references;
  }
  if (
    videoLinks !== undefined &&
    hasArrayChanged(dataStructure.videoLinks, videoLinks)
  ) {
    changes.push("videoLinks");
    dataStructure.videoLinks = videoLinks;
  }

  if (req.user.role === "admin") {
    if (status !== undefined && status !== dataStructure.status) {
      dataStructure.status = status;
      dataStructure.reviewedBy = req.user._id;
      dataStructure.reviewedAt = new Date();
      changes.push(`status to ${status}`);
      contributionType = "review";
    }
    if (
      typeof isVerified === "boolean" &&
      isVerified !== dataStructure.isVerified
    ) {
      dataStructure.isVerified = isVerified;
      dataStructure.reviewedBy = req.user._id;
      dataStructure.reviewedAt = new Date();
      changes.push(`verified status to ${isVerified}`);
      contributionType = "review";
    }
    if (
      typeof isPublished === "boolean" &&
      isPublished !== dataStructure.isPublished
    ) {
      dataStructure.isPublished = isPublished;
      if (isPublished) {
        dataStructure.publishedAt = new Date();
        dataStructure.publishedBy = req.user._id;
      } else {
        dataStructure.publishedAt = undefined;
        dataStructure.publishedBy = undefined;
      }
      changes.push(`published status to ${isPublished}`);
      contributionType = "review";
    }
  }

  if (changes.length > 0) {
    dataStructure.contributors.push({
      user: req.user._id,
      contributionType: contributionType,
      description: `Updated: ${changes.join(", ")}`,
    });
    dataStructure.updatedBy = req.user._id;
  } else {
    return res.json({
      message: "No relevant changes provided for update.",
      dataStructure,
    });
  }

  const updatedDataStructure = await dataStructure.save();
  res.json(updatedDataStructure);
});

const addOperationImplementation = asyncHandler(async (req, res) => {
  const { operationName, codeDetails, explanation, complexity } = req.body;

  if (
    !operationName ||
    !codeDetails ||
    !codeDetails.language ||
    !codeDetails.code ||
    !explanation ||
    !complexity ||
    !complexity.time ||
    !complexity.space
  ) {
    return res.status(400).json({
      message: "Missing required fields for operation implementation.",
    });
  }

  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });
  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  const operation = dataStructure.operations.find(
    (op) => op.name === operationName
  );
  if (!operation) {
    res.status(404);
    throw new Error(
      `Operation "${operationName}" not found on this data structure.`
    );
  }

  const existingImplIndex = operation.implementations.findIndex(
    (impl) => impl.codeDetails.language === codeDetails.language
  );

  if (existingImplIndex >= 0) {
    operation.implementations[existingImplIndex].codeDetails = codeDetails;
    operation.implementations[existingImplIndex].explanation = explanation;
    operation.implementations[existingImplIndex].complexity = complexity;
  } else {
    operation.implementations.push({
      codeDetails,
      explanation,
      complexity,
    });
  }

  dataStructure.contributors.push({
    user: req.user._id,
    contributionType: "code",
    description: `${existingImplIndex >= 0 ? "Updated" : "Added"} ${
      codeDetails.language
    } implementation for operation: ${operationName}`,
  });
  dataStructure.updatedBy = req.user._id;

  const updatedDataStructure = await dataStructure.save();
  res.json(updatedDataStructure);
});

const getAllDataStructures = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    type = "",
    difficulty = "",
  } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const filters = { isDeleted: false };

  if (category) {
    const categoriesArray = Array.isArray(category)
      ? category
      : category.split(",").map((c) => c.trim());
    filters.category = { $in: categoriesArray };
  }

  if (type) filters.type = type;

  // ✅ Optional difficulty filtering (matches Algorithm model)
  if (difficulty) {
    filters.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
  }

  if (search) filters.$text = { $search: search };

  if (req.user?.role !== "admin") {
    filters.isPublished = true;
  }

  try {
    const total = await DataStructure.countDocuments(filters);
    const dataStructures = await DataStructure.find(
      filters,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .select("title slug category definition difficulty tags")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort(search ? { score: { $meta: "textScore" } } : { title: 1 })
      .lean();

    res.json({
      dataStructures,
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("❌ Error in getAllDataStructures:", error);
    res.status(500).json({
      message: "Failed to fetch data structures.",
      error: error.message,
    });
  }
});

const getAllDataStructuresForList = asyncHandler(async (req, res) => {
  const { search = "", category = "", type = "", difficulty = "" } = req.query;

  const filters = {isDeleted: false };

  if (category) {
    const categoriesArray = Array.isArray(category)
      ? category
      : category.split(",").map((c) => c.trim());
    filters.category = { $in: categoriesArray };
  }

  if (type) filters.type = type;

  if (difficulty) {
    filters.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
  }

  if (search) filters.$text = { $search: search };

  if (!req.user || req.user.role !== "admin") {
    filters.$or = [{ isPublished: true }, { isPublished: { $exists: false } }];
  }

  try {
    const dataStructures = await DataStructure.find(
      filters,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .select("title slug category definition difficulty tags")
      .sort(search ? { score: { $meta: "textScore" } } : { title: 1 })
      .lean();

    res.json({
      dataStructures,
      total: dataStructures.length,
    });
  } catch (error) {
    console.error("❌ Error in getAllDataStructuresForList:", error);
    res.status(500).json({
      message: "Failed to fetch data structures for list.",
      error: error.message,
    });
  }
});

const getDataStructureBySlug = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({
    slug: req.params.slug,
    isDeleted: false,
  })
    .populate("contributors.user", "username avatarUrl")
    .populate("reviewedBy", "username avatarUrl")
    .populate("publishedBy", "username avatarUrl")
    .populate("createdBy", "username avatarUrl");

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  if (req.user?.role !== "admin" && !dataStructure.isPublished) {
    res.status(404);
    throw new Error("Data structure not published or accessible.");
  }

  const user = req.user;
  if (user) {
    const alreadyViewedToday = dataStructure.viewedBy.some(
      (entry) =>
        entry.userId.toString() === user._id.toString() &&
        new Date(entry.viewedAt).toDateString() === new Date().toDateString()
    );

    if (!alreadyViewedToday) {
      await DataStructure.updateOne(
        { _id: dataStructure._id },
        {
          $inc: { views: 1 },
          $push: { viewedBy: { userId: user._id, viewedAt: new new Date()() } },
        }
      );

      const updatedDataStructure = await DataStructure.findOne({
        slug: req.params.slug,
        isDeleted: false,
      })
        .populate("contributors.user", "username avatarUrl")
        .populate("reviewedBy", "username avatarUrl")
        .populate("publishedBy", "username avatarUrl")
        .populate("createdBy", "username avatarUrl");
      return res.json(updatedDataStructure);
    }
  }

  res.json(dataStructure);
});

const deleteDataStructure = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this data structure.");
  }

  const updatedDataStructure = await DataStructure.findOneAndUpdate(
    { _id: dataStructure._id },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user._id,
      isPublished: false,
      status: "rejected",
    },
    { new: true }
  );

  res.json({
    message: "Data structure soft-deleted successfully.",
    dataStructure: updatedDataStructure,
  });
});

const voteDataStructure = asyncHandler(async (req, res) => {
  const { type } = req.body || {};
  const userId = req.user._id;

  if (!type) {
    res.status(400);
    throw new Error("Missing vote type in request body.");
  }

  if (!["upvote", "downvote"].includes(type)) {
    res.status(400);
    throw new Error("Invalid vote type. Must be 'upvote' or 'downvote'.");
  }

  const dataStructure = await DataStructure.findOne({
    slug: req.params.slug,
    isDeleted: false,
  });
  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  const alreadyUpvoted = dataStructure.upvotedBy.includes(userId);
  const alreadyDownvoted = dataStructure.downvotedBy.includes(userId);

  const updateOperations = {};
  let message = "";

  if (type === "upvote") {
    if (alreadyUpvoted) {
      updateOperations.$pull = { upvotedBy: userId };
      updateOperations.$inc = { upvotes: -1 };
      message = "Upvote removed";
    } else {
      updateOperations.$addToSet = { upvotedBy: userId };
      updateOperations.$inc = { upvotes: 1 };
      message = "Upvoted";

      if (alreadyDownvoted) {
        updateOperations.$pull = {
          ...updateOperations.$pull,
          downvotedBy: userId,
        };
        updateOperations.$inc.downvotes =
          (updateOperations.$inc.downvotes || 0) - 1;
      }
    }
  } else if (type === "downvote") {
    if (alreadyDownvoted) {
      updateOperations.$pull = { downvotedBy: userId };
      updateOperations.$inc = { downvotes: -1 };
      message = "Downvote removed";
    } else {
      updateOperations.$addToSet = { downvotedBy: userId };
      updateOperations.$inc = { downvotes: 1 };
      message = "Downvoted";

      if (alreadyUpvoted) {
        updateOperations.$pull = {
          ...updateOperations.$pull,
          upvotedBy: userId,
        };
        updateOperations.$inc.upvotes =
          (updateOperations.$inc.upvotes || 0) - 1;
      }
    }
  }

  if (Object.keys(updateOperations).length === 0) {
    return res.json({ message: "No changes made.", dataStructure });
  }

  const updatedDataStructure = await DataStructure.findOneAndUpdate(
    { slug: req.params.slug },
    updateOperations,
    { new: true }
  );

  res.json({
    message,
    dataStructure: updatedDataStructure,
  });
});

const getAllCategories = (req, res) => {
  try {
    const sortedCategories = [...DATA_STRUCTURE].sort();
    res.status(200).json({
      success: true,
      categories: sortedCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const searchDataStructures = asyncHandler(async (req, res) => {
  let {
    category = "",
    q = "",
    type = "",
    difficulty = "",
    tags = "",
    page = 1,
    limit = 10,
  } = req.query;

  const filters = { isDeleted: false };

  if (q) filters.$text = { $search: q };

  const categories = Array.isArray(category)
    ? category
    : category
    ? category.split(",").map((c) => c.trim())
    : [];

  if (categories.length) filters.category = { $in: categories };

  if (type) filters.type = type;
  if (difficulty) filters.difficulty = difficulty;

  if (tags) {
    const tagList = tags.split(",").map((tag) => tag.trim());
    filters.tags = { $in: tagList };
  }

  if (req.user?.role !== "admin") filters.isPublished = true;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const total = await DataStructure.countDocuments(filters);

  const dataStructures = await DataStructure.find(
    filters,
    q ? { score: { $meta: "textScore" } } : {}
  )
    .select("title slug category definition difficulty tags")
    .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

  res.json({
    total,
    results: dataStructures,
    pages: Math.ceil(total / limitNumber),
    currentPage: pageNumber,
  });
});

const getContributors = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({
    slug: req.params.slug,
    isDeleted: false,
  })
    .populate("contributors.user", "username avatarUrl")
    .select("contributors");

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found.");
  }

  res.json(dataStructure.contributors);
});

module.exports = {
  createDataStructure,
  getAllDataStructures,
  getAllDataStructuresForList,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getAllCategories,
  searchDataStructures,
  addOperationImplementation,
  getContributors,
};
