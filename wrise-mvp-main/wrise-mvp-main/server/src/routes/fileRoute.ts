import express from "express";
import { uploadFile } from "../controllers/fileController";

const router = express.Router();

router.post("/upload", uploadFile);

export default router;
