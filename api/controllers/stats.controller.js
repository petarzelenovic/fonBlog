import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";

function getOneMonthAgo() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
}

export const getStats = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to get stats"));
  }

  try {
    const oneMonthAgo = getOneMonthAgo();

    const [
      usersTotal,
      postsTotal,
      commentsTotal,
      usersLastMonth,
      postsLastMonth,
      commentsLastMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
      Post.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
      Comment.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
    ]);

    res.status(200).json({
      users: { total: usersTotal, lastMonth: usersLastMonth },
      posts: { total: postsTotal, lastMonth: postsLastMonth },
      comments: { total: commentsTotal, lastMonth: commentsLastMonth },
    });
  } catch (error) {
    next(error);
  }
};
