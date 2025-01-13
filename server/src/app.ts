import cors from "cors";
import express, { Application, Request, Response } from "express";
//import connectDB from "./config/db";
import { AIMessage, BaseMessage, isAIMessage } from "@langchain/core/messages";
import { initializeChain } from "./llm/chain";
import { v4 as uuidv4 } from "uuid";

const app: Application = express();
const port = process.env.PORT || 4000;

const prettyPrint = (message: BaseMessage) => {
  let txt = `[${message._getType()}]: ${message.content}`;
  if ((isAIMessage(message) && message.tool_calls?.length) || 0 > 0) {
    const tool_calls = (message as AIMessage)?.tool_calls
      ?.map((tc: any) => `- ${tc.name}(${JSON.stringify(tc.args)})`)
      .join("\n");
    txt += ` \nTools: \n${tool_calls}`;
  }
  console.log(txt);
  return txt;
};

(async () => {
  try {
    const graph = await initializeChain();
    app.set("graph", graph);
  } catch (err) {
    console.error("Error initializing graph:", err);
    process.exit(1);
  }
})();

//connectDB()

app.use(express.json());

app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

const threadConfig = {
  configurable: { thread_id: uuidv4() },
  streamMode: "values" as const,
};

app.post("/completion", async (req: Request, res: Response) => {
  const userInput = req.body.text as string;

  if (!userInput) {
    res.status(400).json({ error: "El campo 'text' es obligatorio." });
    return;
  }

  const graph = app.get("graph");
  if (!graph) {
    res.status(500).json({ error: "El grafo no está inicializado." });
    return;
  }

  try {
    const inputs = { messages: [{ role: "user", content: userInput }] };
    const response: { messages: any[] } = { messages: [] };

    for await (const step of await graph.stream(inputs, threadConfig)) {
      const lastMessage = step.messages[step.messages.length - 1];

      if (lastMessage._getType() === "ai") {
        response.messages.push({
          type: "ai",
          content: prettyPrint(lastMessage),
        });
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing completion:", error);
    res
      .status(500)
      .json({ error: "Ocurrió un error procesando la solicitud." });
  }
});

app.listen(port, () => {
  console.log(`Server is run at https://localhost:${port}`);
});
