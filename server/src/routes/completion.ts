import { Router } from "express";
import { completionController } from "../controllers/completion.controller";

const router = Router();

router.post("/", completionController);

export default router;
