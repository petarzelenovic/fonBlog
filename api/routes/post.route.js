import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import {
  create,
  getPosts,
  getPost,
  deletePost,
  updatePost,
} from "../controllers/post.controller.js";
import {
  createComment,
  getPostComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", verifyUser, create);
router.get("/:postId/comments", getPostComments);
router.post("/:postId/comments", verifyUser, createComment);
router.get("/:postId", getPost);
router.patch("/:postId", verifyUser, updatePost);
router.delete("/:postId", verifyUser, deletePost);

export default router;
