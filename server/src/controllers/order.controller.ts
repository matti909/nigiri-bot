import { Request, Response, NextFunction } from "express";
import { createNewOrder } from "../services/order.service";

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res
        .status(400)
        .json({ error: "La orden debe incluir al menos un artículo." });
      return;
    }

    const order = await createNewOrder(items);
    res.status(201).json({ message: "Orden creada exitosamente", order });
  } catch (error) {
    next(error);
  }
};
