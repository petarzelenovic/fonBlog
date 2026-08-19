import express from "express";
import {
  createComment,
  getPostComments,
  likeComment,
} from "../controllers/comment.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/create", verifyUser, createComment);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likeComment/:commentId", verifyUser, likeComment);

export default router;
