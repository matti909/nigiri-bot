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
    <form className="flex space-x-2 w-full max-w-md" onSubmit={handleSubmit}>
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="flex-1 p-2 rounded border"
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};
