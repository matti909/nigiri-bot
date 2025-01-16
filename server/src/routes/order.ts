import express from "express";
import { createOrderHandler, getAll } from "../controllers/order.controller";

const router = express.Router();

router.post("/", createOrderHandler);
router.get("/getorders", getAll);

export default router;
