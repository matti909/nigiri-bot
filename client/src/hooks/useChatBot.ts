import { useCallback, useMemo, useState } from "react";
import { Conversation, OrderItem } from "../types";
import { extractOrder, sanitizeMessage } from "../utils";

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const useChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderCreatedTrigger, setOrderCreatedTrigger] = useState(0); // Trigger para refetch

  // Generar sessionId una sola vez y mantenerlo durante toda la sesión
  const sessionId = useMemo(() => generateSessionId(), []);

  const apiUrl = "http://localhost:4000/completion";

  const handleReset = () => {
    setOrder(null);
  };

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
          body: JSON.stringify({
            text: userMessage,
            sessionId
          }),
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

        // Detectar si el LLM creó un pedido con el tool create_order
        if (streamedMessage.includes("create_order")) {
          // Activar trigger para que Orders refetch
          setOrderCreatedTrigger((prev) => prev + 1);
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
    orderCreatedTrigger, // Para que Orders detecte cuando se creó un pedido
    setUserMessage,
    setOrder,
    handleSubmit,
    handleReset,
  };
};
