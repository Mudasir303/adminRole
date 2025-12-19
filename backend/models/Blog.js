const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  image: String,
  category: {
    type: String,
    default: 'Technology'
  },
  published: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);
