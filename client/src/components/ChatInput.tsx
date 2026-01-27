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
      className="flex items-center gap-3 mt-6 w-full"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Escribe tu mensaje aquí... (Ej: 'Quiero 2 California Roll')"
        className="flex-1 px-5 py-4 text-base rounded-xl border-2 border-input bg-background text-sushi-text placeholder-muted focus:ring-2 focus:ring-sushi-accent focus:border-sushi-accent transition-all shadow-sm"
        autoFocus
      />
      <button
        type="submit"
        className={`px-6 py-4 text-base font-medium rounded-xl text-white transition-all shadow-md ${
          loading
            ? "cursor-not-allowed bg-muted opacity-70"
            : "bg-sushi-accent hover:bg-sushi-accent/90 hover:shadow-lg active:scale-95"
        }`}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};
