import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", verifyUser, createCategory);
router.patch("/:categoryId", verifyUser, updateCategory);
router.delete("/:categoryId", verifyUser, deleteCategory);

export default router;
