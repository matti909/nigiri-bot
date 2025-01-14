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
