const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth.middleware");
const { createBlogValidator, updateBlogValidator } = require("../middleware/validateBlog");
const {
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
} = require("../controllers/blog.controller");

// Public fetch (approved only)
router.get("/", listPublicBlogs);
router.get("/:slug", getBySlug);

// Authenticated interactions
router.post("/", protect, createBlogValidator, createBlog);
router.put("/:id", protect, updateBlogValidator, updateBlog);
router.delete("/:id", protect, admin, deleteBlog);

// Moderation (admin)
router.put("/:id/approve", protect, admin, approveBlog);
router.put("/:id/reject", protect, admin, rejectBlog);

// Engagement
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);

module.exports = router;
