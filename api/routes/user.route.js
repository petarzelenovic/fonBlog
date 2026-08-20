import express from "express";
import {
  updateUser,
  deleteUser,
  getUsers,
  getUser,
} from "../controllers/user.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyUser, getUsers);
router.get("/:userId", getUser);
router.patch("/:userId", verifyUser, updateUser);
router.delete("/:userId", verifyUser, deleteUser);

export default router;
