import { prettyPrint } from "../utils";
import { v4 as uuidv4 } from "uuid";

const threadConfig = {
  configurable: { thread_id: uuidv4() },
  streamMode: "values" as const,
};

export const chatCompletions = async (userInput: string, graph: any) => {
  if (!graph) {
    throw new Error("El grafo no está inicializado.");
  }

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

  return response;
};
