import Category from "../models/category.model.js";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories.js";

export async function seedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate({ slug: category.slug }, category, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }
}
