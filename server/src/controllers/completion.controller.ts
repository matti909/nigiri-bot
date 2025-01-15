import { Request, Response } from "express";
import { chatCompletions } from "../services/completion.service";

export const completionController = async (req: Request, res: Response) => {
  const userInput = req.body.text as string;

  if (!userInput) {
    res.status(400).json({ error: "El campo 'text' es obligatorio." });
    return;
  }

  const graph = req.app.get("graph");
  try {
    const response = await chatCompletions(userInput, graph);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing completion:", error);
    res
      .status(500)
      .json({ error: "Ocurrió un error procesando la solicitud." });
  }
};
