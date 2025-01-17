import { useEffect, useRef } from "react";
import { Conversation } from "../types";

type Props = {
  conversations: Conversation[];
  loading: boolean;
  aiMessage: string;
};

export const Conversations = ({ conversations, loading, aiMessage }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, loading]);

  return (
    <section>
      <h1 className="py-4 m-2 text-2xl font-bold text-balance text-sushi-paper">
        Nigiri Chatbot 🍣
      </h1>
      <div className="overflow-y-auto p-4 space-y-4 w-full max-w-md h-96 rounded-lg border border-border bg-background">
        {conversations.map((conv, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              conv.isHuman
                ? "bg-sushi-accent text-white self-end ml-auto"
                : "bg-zinc-800 text-sushi-text"
            }`}
          >
            {conv.message.toString()}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-zinc-800 text-sushi-muted">
            {aiMessage || "Cargando..."}
          </div>
        )}
        {/* Elemento sentinela para el scroll */}
        <div ref={bottomRef} />
      </div>
    </section>
  );
};
