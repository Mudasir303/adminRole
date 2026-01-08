const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  shortDescription: String,
  content: String,
  author: String,
  authorBio: String,
  image: String,
  category: {
    type: String,
    default: 'Technology'
  },
  published: {
    type: Boolean,
    default: true
  },
  sections: [{
    heading: String,
    content: String,
    image: String
  }]
}, { timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);
