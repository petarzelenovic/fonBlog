import { errorHandler } from "../utils/error.js";
import Category from "../models/category.model.js";
import Post from "../models/post.model.js";

export const getCategories = async (req, res, next) => {
  try {
    const [categories, counts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Post.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);
    const countBySlug = Object.fromEntries(
      counts.map((item) => [item._id, item.count]),
    );

    res.status(200).json(
      categories.map((category) => ({
        ...category,
        postsCount: countBySlug[category.slug] || 0,
      })),
    );
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to create a category"));
  }

  const { name, color, slug } = req.body;
  if (!name?.trim() || !color?.trim() || !slug?.trim()) {
    return next(errorHandler(400, "Name, color and slug are required"));
  }

  try {
    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      color: color.trim(),
    });
    res
      .status(201)
      .location(`/api/categories/${category._id}`)
      .json(category);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Category slug already exists"));
    }
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to update a category"));
  }

  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return next(errorHandler(404, "Category not found"));
    }

    const previousSlug = category.slug;
    const nextSlug = req.body.slug?.trim() || category.slug;
    const nextName = req.body.name?.trim() || category.name;
    const nextColor = req.body.color?.trim() || category.color;

    category.name = nextName;
    category.slug = nextSlug;
    category.color = nextColor;
    await category.save();

    if (previousSlug !== nextSlug) {
      await Post.updateMany({ category: previousSlug }, { category: nextSlug });
    }

    res.status(200).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Category slug already exists"));
    }
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to delete a category"));
  }

  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return next(errorHandler(404, "Category not found"));
    }

    const postsCount = await Post.countDocuments({ category: category.slug });
    if (postsCount > 0) {
      return next(
        errorHandler(
          409,
          "Cannot delete a category that is used by existing posts",
        ),
      );
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export async function validateCategorySlug(slug) {
  if (!slug) {
    throw errorHandler(400, "Category is required");
  }

  const category = await Category.findOne({ slug });
  if (!category) {
    throw errorHandler(404, "Invalid category");
  }

  return category;
}
