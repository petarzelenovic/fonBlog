import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/getcategories", getCategories);
router.post("/create", verifyUser, createCategory);
router.put("/update/:categoryId", verifyUser, updateCategory);
router.delete("/delete/:categoryId", verifyUser, deleteCategory);

export default router;
