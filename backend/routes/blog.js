const express = require("express");
const Blog = require("../models/Blog");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../config/upload");

const router = express.Router();

// GET blogs (public)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// CREATE blog (admin + image)
router.post(
  "/",
  auth,
  admin,
  upload.single("image"),
  async (req, res) => {
    try {
      const blog = await Blog.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author || "Admin",
        category: req.body.category || "Technology",
        image: req.file ? `/uploads/${req.file.filename}` : ""
      });

      res.json(blog);
    } catch (err) {
      res.status(500).json({ message: "Failed to create blog" });
    }
  }
);


// UPDATE blog (admin)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE blog (admin)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
