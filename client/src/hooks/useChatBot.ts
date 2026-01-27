import { useCallback, useEffect, useMemo, useState } from "react";
import { Conversation, OrderItem } from "../types";
import { extractOrder, sanitizeMessage } from "../utils";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Helper: obtener datos de localStorage con TTL de 1 día
const getStorageWithTTL = <T,>(key: string): T | null => {
  try {
    const timestamp = localStorage.getItem("chatbot_timestamp");
    if (!timestamp || Date.now() - parseInt(timestamp) > ONE_DAY_MS) {
      localStorage.clear(); // Limpiar todo si expiró
      return null;
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Helper: guardar en localStorage y actualizar timestamp
const setStorageWithTTL = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem("chatbot_timestamp", Date.now().toString());
};

export const useChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>(
    () => getStorageWithTTL<Conversation[]>("chatbot_conversations") || []
  );
  const [userMessage, setUserMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderItem[] | null>(
    () => getStorageWithTTL<OrderItem[]>("chatbot_order")
  );
  const [error, setError] = useState<string | null>(null);
  const [orderCreatedTrigger, setOrderCreatedTrigger] = useState(0);

  const sessionId = useMemo(() => {
    const stored = getStorageWithTTL<string>("chatbot_session_id");
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    setStorageWithTTL("chatbot_session_id", newId);
    return newId;
  }, []);

  useEffect(() => {
    if (conversations.length) setStorageWithTTL("chatbot_conversations", conversations);
  }, [conversations]);

  useEffect(() => {
    order ? setStorageWithTTL("chatbot_order", order) : localStorage.removeItem("chatbot_order");
  }, [order]);

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
