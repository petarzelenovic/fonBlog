import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return next(errorHandler(400, "Comment cannot be empty"));
    }
    if (content.length > 200) {
      return next(
        errorHandler(400, "Comment cannot be more than 200 characters"),
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    let resolvedParentId = null;
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent) {
        return next(errorHandler(404, "Parent comment not found"));
      }
      if (parent.postId.toString() !== String(postId)) {
        return next(
          errorHandler(400, "Reply must belong to the same post"),
        );
      }
      if (parent.parentId) {
        return next(
          errorHandler(400, "Replies to replies are not allowed"),
        );
      }
      resolvedParentId = parent._id;
    }

    const newComment = new Comment({
      content: content.trim(),
      postId,
      userId,
      parentId: resolvedParentId,
    });
    await newComment.save();
    res
      .status(201)
      .location(`/api/comments/${newComment._id}`)
      .json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to edit this comment"),
      );
    }
    if (!req.body.content || req.body.content.trim().length === 0) {
      return next(errorHandler(400, "Comment cannot be empty"));
    }
    if (req.body.content.length > 200) {
      return next(
        errorHandler(400, "Comment cannot be more than 200 characters"),
      );
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { content: req.body.content },
      { new: true },
    );
    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this comment"),
      );
    }
    const result = await Comment.deleteMany({
      $or: [{ _id: comment._id }, { parentId: comment._id }],
    });
    if (result.deletedCount === 0) {
      return next(errorHandler(404, "Comment not found"));
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to get all comments"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const query = {};

    if (req.query.searchTerm) {
      const regex = { $regex: req.query.searchTerm, $options: "i" };
      const [users, posts] = await Promise.all([
        User.find({ username: regex }).select("_id"),
        Post.find({ title: regex }).select("_id"),
      ]);
      query.$or = [
        { content: regex },
        { userId: { $in: users.map((user) => user._id) } },
        { postId: { $in: posts.map((post) => post._id) } },
      ];
    }

    const comments = await Comment.find(query)
      .populate("userId", "username profilePicture")
      .populate("postId", "title slug image")
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalComments = await Comment.countDocuments(query);
    res.status(200).json({
      comments,
      total: totalComments,
    });
  } catch (error) {
    next(error);
  }
};
