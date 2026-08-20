import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import { getStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/", verifyUser, getStats);

export default router;
