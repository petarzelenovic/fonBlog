import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    if (userId !== req.user.id) {
      return next(
        errorHandler(
          403,
          "You are not allowed to create a comment for this post",
        ),
      );
    }

    const newComment = new Comment({ content, postId, userId });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    const commentsWithUser = comments.map(({ userId, ...rest }) => ({
      ...rest,
      user: userId,
    }));

    res.status(200).json(commentsWithUser);
  } catch (error) {
    next(error);
  }
};
