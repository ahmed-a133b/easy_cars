const ForumPost = require('../models/ForumPost');

exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('author', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = await ForumPost.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
