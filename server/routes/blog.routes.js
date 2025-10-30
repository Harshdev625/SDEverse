const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/blog.controller");

const { protect, admin } = require("../middleware/auth.middleware");

// Public routes
router.get("/", getAllBlogs);
router.get("/categories", getBlogCategories);
router.get("/tags", getPopularTags);
router.get("/:slug", getBlogBySlug);
router.get("/author/:username", getBlogsByAuthor);

// Protected routes (authenticated users)
router.post("/", protect, createBlog);
router.get("/user/my-blogs", protect, getMyBlogs);
// Get a blog by slug for the author or admin (includes drafts)
router.get("/user/:slug", protect, getBlogBySlugForUser);
router.put("/:slug", protect, updateBlog);
router.delete("/:slug", protect, deleteBlog);
router.post("/:slug/like", protect, likeBlog);

// Admin review routes
router.get("/admin/drafts", protect, admin, getDraftBlogs);
router.put("/admin/:slug/publish", protect, admin, publishBlog);
router.delete("/admin/:slug/reject", protect, admin, rejectBlog);

module.exports = router;