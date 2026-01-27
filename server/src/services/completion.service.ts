import { prettyPrint } from "../utils";

export const chatCompletions = async (
  userInput: string,
  graph: any,
  sessionId: string
) => {
  if (!graph) {
    throw new Error("El grafo no está inicializado.");
  }

  if (!sessionId) {
    throw new Error("sessionId es requerido para mantener el contexto de la conversación.");
  }

  const threadConfig = {
    configurable: { thread_id: sessionId },
    streamMode: "values" as const,
  };

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
