import express from "express";
import { createOrderHandler } from "../controllers/order.controller";

const router = express.Router();

router.post("/", createOrderHandler);

export default router;
