import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";
import { isValidUsername } from "../utils/username.js";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only update your own account"));
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long"),
      );
    }
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }

  if (req.body.username) {
    if (req.body.username.length < 3 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 3 and 20 characters long"),
      );
    }
    if (!isValidUsername(req.body.username)) {
      return next(
        errorHandler(
          400,
          "Korisničko ime može sadržati samo slova, brojeve, tačku i donju crtu",
        ),
      );
    }
    req.body.username = req.body.username.toLowerCase();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ ...rest });
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Username or email already exists"));
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const userId = user._id;
    const userIdStr = userId.toString();
    const postIds = await Post.find({ userId }).distinct("_id");
    const commentIds = await Comment.find({ userId }).distinct("_id");

    await Comment.deleteMany({
      $or: [
        { userId },
        { postId: { $in: postIds } },
        { parentId: { $in: commentIds } },
      ],
    });
    await Comment.updateMany(
      { likes: userIdStr },
      { $pull: { likes: userIdStr }, $inc: { numberOfLikes: -1 } },
    );
    await Post.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    if (req.user.id === req.params.userId) {
      res.clearCookie("access_token");
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to get users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const query = {
      ...(req.query.searchTerm && {
        $or: [
          { username: { $regex: req.query.searchTerm, $options: "i" } },
          { email: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const users = await User.find(query)
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments(query);
    res.status(200).json({
      users: usersWithoutPassword,
      total: totalUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
