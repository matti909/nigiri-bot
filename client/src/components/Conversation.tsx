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
    <section className="flex flex-col">
      <h1 className="py-6 px-2 text-3xl font-bold text-sushi-paper">
        🍣 Nigiri Chatbot
      </h1>
      <div className="overflow-y-auto p-6 space-y-4 rounded-xl border border-border bg-background shadow-lg h-[600px] lg:h-[calc(100vh-220px)]">
        {conversations.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-center text-muted">
            <p className="text-lg">
              ¡Hola! 👋 Escribe un mensaje para comenzar...
            </p>
          </div>
        )}
        {conversations.map((conv, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl max-w-[85%] shadow-md text-base leading-relaxed ${
              conv.isHuman
                ? "bg-sushi-accent text-white self-end ml-auto"
                : "bg-zinc-800 text-sushi-text"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {conv.message.toString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="p-4 rounded-xl bg-zinc-800 text-sushi-muted shadow-md animate-pulse">
            {aiMessage || "Escribiendo..."}
          </div>
        )}
        {/* Elemento sentinela para el scroll */}
        <div ref={bottomRef} />
      </div>
    </section>
  );
};
