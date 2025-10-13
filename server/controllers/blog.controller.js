const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

// Create blog (user submit -> pending)
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, studySubtype, company, role, tags = [] } = req.body;
  if (!title || !content || !category) {
    res.status(400);
    throw new Error("title, content, and category are required");
  }
  const slug = await generateUniqueSlug(title);
  const blog = await Blog.create({
    title,
    slug,
    content,
    category,
    studySubtype: category === "StudyResources" ? studySubtype : undefined,
    company: category === "InterviewExperiences" ? company : undefined,
    role: category === "InterviewExperiences" ? role : undefined,
    tags,
    author: req.user._id,
    status: "pending",
  });
  res.status(201).json(blog);
});

// Public list (approved only) with filters & sorting
const listPublicBlogs = asyncHandler(async (req, res) => {
  const { category, tag, company, studySubtype, q, sort = "-createdAt" } = req.query;
  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (tag) filter.tags = { $in: [tag] };
  if (company) filter.company = company;
  if (studySubtype) filter.studySubtype = studySubtype;
  if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { content: { $regex: q, $options: "i" } }, { tags: { $regex: q, $options: "i" } }];

  const blogs = await Blog.find(filter)
    .select("title slug category studySubtype company role tags createdAt likesCount author")
    .populate("author", "username")
    .sort(sort);
  res.json(blogs);
});

// Admin list (any status) + filters
const listAdminBlogs = asyncHandler(async (req, res) => {
  const { status, category, tag, company, q, sort = "-createdAt" } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (tag) filter.tags = { $in: [tag] };
  if (company) filter.company = company;
  if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { content: { $regex: q, $options: "i" } }];
  const blogs = await Blog.find(filter).populate("author", "username").sort(sort);
  res.json(blogs);
});

// Get by slug (public: only approved; author/admin can view own pending)
const getBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate("author", "username");
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  if (blog.status !== "approved") {
    if (!req.user || (req.user.role !== "admin" && blog.author._id.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error("Not authorized to view this blog");
    }
  }
  res.json(blog);
});

// Update blog (author can edit while pending/rejected; admin can edit anytime)
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  const isAuthor = blog.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isAuthor && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this blog");
  }
  if (isAuthor && !isAdmin && blog.status === "approved") {
    res.status(400);
    throw new Error("Approved blogs can only be edited by admin");
  }

  const allowed = ["title", "content", "category", "studySubtype", "company", "role", "tags", "status", "reviewNotes"];
  for (const k of allowed) {
    if (req.body[k] !== undefined) blog[k] = req.body[k];
  }
  if (req.body.title && req.body.title !== blog.title) {
    blog.slug = await generateUniqueSlug(req.body.title);
  }
  if (isAdmin && req.body.status && ["approved", "rejected", "pending"].includes(req.body.status)) {
    blog.reviewedBy = req.user._id;
    blog.reviewedAt = new Date();
  }
  const updated = await blog.save();
  res.json(updated);
});

// Delete blog (admin)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
});

// Moderation endpoints (admin)
const approveBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error("Blog not found"); }
  blog.status = "approved";
  blog.reviewedBy = req.user._id;
  blog.reviewedAt = new Date();
  await blog.save();
  res.json(blog);
});

const rejectBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error("Blog not found"); }
  blog.status = "rejected";
  blog.reviewNotes = req.body?.reviewNotes || blog.reviewNotes;
  blog.reviewedBy = req.user._id;
  blog.reviewedAt = new Date();
  await blog.save();
  res.json(blog);
});

// Interactions
const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error("Blog not found"); }
  const uid = req.user._id.toString();
  const idx = blog.likedBy.findIndex((u) => u.toString() === uid);
  if (idx === -1) {
    blog.likedBy.push(req.user._id);
    blog.likesCount += 1;
  } else {
    blog.likedBy.splice(idx, 1);
    blog.likesCount = Math.max(0, blog.likesCount - 1);
  }
  await blog.save();
  res.json({ likesCount: blog.likesCount, liked: idx === -1 });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) { res.status(404); throw new Error("Blog not found"); }
  const uid = req.user._id.toString();
  const idx = blog.bookmarkedBy.findIndex((u) => u.toString() === uid);
  let bookmarked;
  if (idx === -1) {
    blog.bookmarkedBy.push(req.user._id);
    bookmarked = true;
  } else {
    blog.bookmarkedBy.splice(idx, 1);
    bookmarked = false;
  }
  await blog.save();
  res.json({ bookmarked });
});

module.exports = {
  createBlog,
  listPublicBlogs,
  listAdminBlogs,
  getBySlug,
  updateBlog,
  deleteBlog,
  approveBlog,
  rejectBlog,
  toggleLike,
  toggleBookmark,
};
