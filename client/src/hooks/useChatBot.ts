import { useCallback, useState } from "react";
import { Conversation, OrderItem } from "../types";
import { extractOrder, sanitizeMessage } from "../utils";

export const useChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [order, setOrder] = useState<OrderItem[] | null>(null);
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

        if (extractedOrder) {
          setOrder(extractedOrder);
        }

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
