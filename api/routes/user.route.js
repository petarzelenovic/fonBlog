import express from "express";
import { test } from "../contollers/user.contoller.js";

const router = express.Router();

router.get("/test", test);

export default router;
