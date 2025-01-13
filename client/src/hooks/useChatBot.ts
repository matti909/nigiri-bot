import { useState, useCallback } from "react";

interface Message {
  type: "ai";
  content: string;
}

interface Conversation {
  message: string | Message;
  isHuman: boolean;
}

const sanitizeMessage = (rawContent: string): string => {
  try {
    const parsed = JSON.parse(rawContent);

    if (Array.isArray(parsed.messages)) {
      return parsed.messages
        .filter((msg: { type: string }) => msg.type === "ai")
        .map((msg: { content: string }) => {
          const sanitizedContent = msg.content.replace(
            /\[ai\]:.*?Tools:.*?\)\s*/s,
            ""
          );
          return sanitizedContent.replace(/\[ai\]:\s*/, "");
        })
        .filter((content: string) => content.trim() !== "")
        .join("\n");
    }
  } catch {
    return rawContent;
  }

  return rawContent;
};

const extractOrder = (rawContent: string): string[] | null => {
  try {
    const parsed = JSON.parse(rawContent);

    if (Array.isArray(parsed.messages)) {
      for (const msg of parsed.messages) {
        if (msg.type === "ai" && msg.content.includes("botSteps")) {
          const match = msg.content.match(/botSteps\((.*?)\)/);
          if (match) {
            const botStepsData = JSON.parse(match[1]);
            return botStepsData.order?.items || null;
          }
        }
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const useChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [order, setOrder] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = "http://localhost:4000/completion";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!userMessage.trim()) return;

      setConversations((prev) => [
        ...prev,
        {
          message: userMessage,
          isHuman: true,
        },
      ]);

      setUserMessage("");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: userMessage }),
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        let streamedMessage = "";
        const reader = res.body!.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const decoded = new TextDecoder("utf-8").decode(value);
          streamedMessage += decoded;

          setAiMessage((prev) => prev + decoded);
        }

        const sanitizedMessage = sanitizeMessage(streamedMessage);
        const extractedOrder = extractOrder(streamedMessage);
        setOrder(extractedOrder);

        setConversations((prev) => [
          ...prev,
          {
            message: sanitizedMessage,
            isHuman: false,
          },
        ]);
      } catch (err) {
        setError((err as Error).message || "Ocurrió un error desconocido.");
      } finally {
        setLoading(false);
        setAiMessage("");
      }
    },
    [userMessage]
  );

  return {
    conversations,
    aiMessage,
    userMessage,
    order,
    loading,
    error,
    setUserMessage,
    handleSubmit,
  };
};
