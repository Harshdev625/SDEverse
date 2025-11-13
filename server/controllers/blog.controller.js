const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const getAllBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { category, tag, author, search } = req.query;

  let query = { isPublished: true, isDeleted: false };

  query.reviewStatus = "approved";

  if (category) query.category = category;
  if (tag) query.tags = { $in: [tag] };
  if (author) query.author = author;
  if (search) {
    query.$text = { $search: search };
  }

  const blogs = await Blog.find(query)
    .populate("author", "username fullName avatarUrl")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-content");

  const total = await Blog.countDocuments(query);

  res.json({
    blogs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isPublished: true,
    reviewStatus: "approved",
    isDeleted: false,
  }).populate("author", "username fullName avatarUrl bio");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

  res.json(blog);
});

const getBlogBySlugForUser = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isDeleted: false,
  }).populate("author", "username fullName avatarUrl bio");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.isPublished) {
    return res.json(blog);
  }

  if (
    blog.author._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this blog");
  }

  res.json(blog);
});

const getBlogsByAuthor = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const blogs = await Blog.find({
    author: user._id,
    isPublished: true,
    isDeleted: false,
  })
    .populate("author", "username fullName avatarUrl")
    .sort({ publishedAt: -1 })
    .select("-content");

  res.json(blogs);
});

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, tags, category, featuredImage, status } =
    req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const slug = slugify(title, { lower: true, strict: true });

  const existingBlog = await Blog.findOne({ slug });
  if (existingBlog) {
    res.status(400);
    throw new Error("A blog with this title already exists");
  }

  const blogData = {
    title,
    slug,
    content,
    excerpt,
    tags: tags || [],
    category: category || "Discussion",
    featuredImage,
    author: req.user._id,
    status: status || "draft",

    reviewStatus: "pending",
    isPublished: false,
    publishedAt: null,
    publishedBy: null,
  };

  const blog = await Blog.create(blogData);

  await User.findByIdAndUpdate(req.user._id, { $inc: { totalProposals: 1 } });

  const populatedBlog = await Blog.findById(blog._id).populate(
    "author",
    "username fullName avatarUrl"
  );

  res.status(201).json(populatedBlog);
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isDeleted: false,
  });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this blog");
  }

  const { title, content, excerpt, tags, category, featuredImage, status } =
    req.body;

  let newSlug = blog.slug;
  if (title && title !== blog.title) {
    newSlug = slugify(title, { lower: true, strict: true });
    const existingBlog = await Blog.findOne({
      slug: newSlug,
      _id: { $ne: blog._id },
    });
    if (existingBlog) {
      res.status(400);
      throw new Error("A blog with this title already exists");
    }
  }

  const updateData = {
    ...(title && { title }),
    ...(newSlug !== blog.slug && { slug: newSlug }),
    ...(content && { content }),
    ...(excerpt && { excerpt }),
    ...(tags && { tags }),
    ...(category && { category }),
    ...(featuredImage !== undefined && { featuredImage }),
    ...(status && { status }),
  };

  if (status === "published" && blog.status !== "published") {
    updateData.status = "published";
    updateData.reviewStatus = "pending";
    updateData.isPublished = false;
    updateData.publishedAt = null;
    updateData.publishedBy = null;
  } else if (status === "draft" && blog.status === "published") {
    updateData.isPublished = false;
    updateData.publishedAt = null;
    updateData.publishedBy = null;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(blog._id, updateData, {
    new: true,
  }).populate("author", "username fullName avatarUrl");

  res.json(updatedBlog);
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isDeleted: false,
  });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this blog");
  }

  await Blog.findByIdAndUpdate(blog._id, {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user._id,
  });

  res.json({ message: "Blog deleted successfully" });
});

const likeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isPublished: true,
    isDeleted: false,
  });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const userId = req.user._id;
  const isLiked = blog.likedBy.includes(userId);

  if (isLiked) {
    blog.likedBy = blog.likedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    blog.likes = Math.max(0, blog.likes - 1);
  } else {
    blog.likedBy.push(userId);
    blog.likes += 1;
  }

  await blog.save();

  res.json({
    liked: !isLiked,
    likesCount: blog.likes,
  });
});

const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    author: req.user._id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .select("-content");

  res.json(blogs);
});

const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = [
    "Tutorial",
    "Interview Experience",
    "Tips & Tricks",
    "Discussion",
    "News",
    "Other",
  ];

  res.json(categories);
});

const getPopularTags = asyncHandler(async (req, res) => {
  const tags = await Blog.aggregate([
    { $match: { isPublished: true, isDeleted: false } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json(tags.map((tag) => tag._id));
});

const getDraftBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { status: "draft", isDeleted: false };

  const drafts = await Blog.find(query)
    .populate("author", "username fullName avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.json({
    drafts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDrafts: total,
    },
  });
});

const publishBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isDeleted: false });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.status = "published";
  blog.isPublished = true;
  blog.publishedAt = new Date();
  blog.publishedBy = req.user._id;
  blog.reviewStatus = "approved";
  blog.reviewedBy = req.user._id;
  blog.reviewedAt = new Date();

  const updated = await blog.save();

  const populated = await Blog.findById(updated._id).populate(
    "author",
    "username fullName avatarUrl"
  );

  res.json(populated);
});

const rejectBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isDeleted: false });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.isDeleted = true;
  blog.deletedAt = new Date();
  blog.deletedBy = req.user._id;

  await blog.save();

  res.json({ message: "Draft rejected/deleted" });
});

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getBlogBySlugForUser,
  getBlogsByAuthor,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getMyBlogs,
  getBlogCategories,
  getPopularTags,
  getDraftBlogs,
  publishBlog,
  rejectBlog,
};
