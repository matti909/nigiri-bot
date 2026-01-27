import { Request, Response } from "express";
import { chatCompletions } from "../services/completion.service";

export const completionController = async (req: Request, res: Response) => {
  const { text: userInput, sessionId } = req.body;

  if (!userInput) {
    res.status(400).json({ error: "El campo 'text' es obligatorio." });
    return;
  }

  if (!sessionId) {
    res.status(400).json({
      error: "El campo 'sessionId' es obligatorio para mantener el contexto de la conversación."
    });
    return;
  }

  const graph = req.app.get("graph");
  try {
    const response = await chatCompletions(userInput, graph, sessionId);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing completion:", error);
    res
      .status(500)
      .json({ error: "Ocurrió un error procesando la solicitud." });
  }
};
