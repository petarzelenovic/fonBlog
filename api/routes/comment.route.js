import express from "express";
import {
  likeComment,
  editComment,
  deleteComment,
  getComments,
} from "../controllers/comment.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyUser, getComments);
router.post("/:commentId/likes", verifyUser, likeComment);
router.patch("/:commentId", verifyUser, editComment);
router.delete("/:commentId", verifyUser, deleteComment);

export default router;
