import { OrderItem } from "../types";

export const sanitizeMessage = (rawContent: string): string => {
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

export const extractOrder = (rawContent: string): OrderItem[] | null => {
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

export const submitOrder = async (order: OrderItem[] | null, uri: string) => {
  if (!order || order.length === 0) {
    console.error("El pedido está vacío");
    alert("El pedido está vacío");
    return;
  }

  const requestPayload = {
    items: order.map((item) => ({
      details: {
        name: item.name,
        price: item.price,
      },
      quantity: item.quantity,
    })),
  };

  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Orden enviada exitosamente:", data);
    alert("Orden enviada con éxito");
  } catch (error) {
    console.error("Error al enviar la orden:", error);
    alert("Hubo un problema al enviar la orden");
  }
};

export const calculateTotal = (items: OrderItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);
