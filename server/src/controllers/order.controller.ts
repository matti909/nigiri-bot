import { Request, Response, NextFunction } from "express";
import { createNewOrder, getAllOrders } from "../services/order.service";

export const createOrderHandler = async (
  req: Request,
  res: Response
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
    //next(error);
    console.log(error);
    res.status(500).send(error);
  }
};

export const getAll = async (_req: any, res: Response) => {
  try {
    const order = await getAllOrders();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).send(error);
  }
};
