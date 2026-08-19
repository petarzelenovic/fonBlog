import express from "express";
import {
  createComment,
  getPostComments,
} from "../controllers/comment.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/create", verifyUser, createComment);
router.get("/getPostComments/:postId", getPostComments);

export default router;
