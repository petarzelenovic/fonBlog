import { errorHandler } from "../utils/error.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { validateCategorySlug } from "./category.controller.js";

function isEmptyHtml(html = "") {
  return (
    String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim().length === 0
  );
}

function hasRequiredPostFields(body = {}) {
  return (
    Boolean(body.title?.trim()) &&
    Boolean(body.image?.trim()) &&
    Boolean(body.category?.trim()) &&
    !isEmptyHtml(body.content)
  );
}

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to create a post"));
  }
  if (!hasRequiredPostFields(req.body)) {
    return next(
      errorHandler(400, "Naslov, naslovna slika i sadržaj su obavezni"),
    );
  }

  try {
    await validateCategorySlug(req.body.category);

    const slug = req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");

    const newPost = new Post({
      ...req.body,
      slug,
      userId: req.user.id,
    });

    const savedPost = await newPost.save();
    res.status(201).location(`/api/posts/${savedPost._id}`).json(savedPost);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Postoji objava sa takvim naslovom"));
    }
    return next(error.statusCode ? error : errorHandler(500, error.message));
  }
};

function parseCategoryQuery(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      values
        .flatMap((item) => String(item).split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const selectedCategories = parseCategoryQuery(req.query.category);
    const query = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(selectedCategories.length === 1 && {
        category: selectedCategories[0],
      }),
      ...(selectedCategories.length > 1 && {
        category: { $in: selectedCategories },
      }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };
    const posts = await Post.find(query)
      .populate("userId", "username profilePicture")
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      total: totalPosts,
    });
  } catch (error) {
    return next(error);
  }
};

function isMongoId(value) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = isMongoId(postId)
      ? await Post.findById(postId).populate(
          "userId",
          "username profilePicture",
        )
      : await Post.findOne({ slug: postId }).populate(
          "userId",
          "username profilePicture",
        );

    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    res.status(200).json(post);
  } catch (error) {
    return next(error);
  }
};

export const deletePost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not authorized to delete this post"),
    );
  }
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }
    await Comment.deleteMany({ postId: post._id });
    await Post.findByIdAndDelete(post._id);
    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export const updatePost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not authorized to update this post"),
    );
  }
  if (!hasRequiredPostFields(req.body)) {
    return next(
      errorHandler(400, "Naslov, naslovna slika i sadržaj su obavezni"),
    );
  }

  try {
    await validateCategorySlug(req.body.category);

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          shortDescription: req.body.shortDescription,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true },
    );
    if (!updatedPost) {
      return next(errorHandler(404, "Post not found"));
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    return next(error);
  }
};
