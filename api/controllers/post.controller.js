import { errorHandler } from "../utils/error.js";
import Post from "../models/Post.model.js";

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to create a post"));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json({ message: "Post created successfully", savedPost });
  } catch (error) {
    return next(errorHandler(500, error.message));
  }
};

export const getPosts = async (req, res) => {
  const posts = await Post.find();
  res.status(200).json(posts);
};

export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.status(200).json(post);
};

export const updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ message: "Post updated successfully", post });
};

export const deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Post deleted successfully" });
};
