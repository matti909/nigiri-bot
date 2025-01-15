import React from "react";

type Props = {
  userMessage: string;
  loading: boolean;
  setUserMessage: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export const ChatInput = ({
  userMessage,
  setUserMessage,
  loading,
  handleSubmit,
}: Props) => {
  return (
    <form
      className="flex items-center mt-4 space-x-2 w-full max-w-md"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="flex-1 p-2 rounded-lg border border-input bg-background text-sushi-text placeholder-muted focus:ring-2 focus:ring-sushi-accent"
      />
      <button
        type="submit"
        className={`px-4 py-2 rounded-lg text-white transition ${
          loading
            ? "cursor-not-allowed bg-muted"
            : "bg-sushi-accent hover:bg-sushi-accent/90"
        }`}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};
