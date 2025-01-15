import { Conversation } from "../types";

type Props = {
  conversations: Conversation[];
  loading: boolean;
  aiMessage: string;
};

export const Conversations = ({ conversations, loading, aiMessage }: Props) => {
  return (
    <div className="overflow-y-auto p-4 space-y-2 w-full max-w-md h-96 rounded border">
      {conversations.map((conv, index) => (
        <div
          key={index}
          className={`p-2 rounded ${
            conv.isHuman ? "bg-blue-800 text-right" : "bg-gray-800 text-left"
          }`}
        >
          {conv.message.toString()}
        </div>
      ))}
      {loading && (
        <div className="p-2 text-left bg-gray-800 rounded">
          {aiMessage || "Cargando..."}
        </div>
      )}
    </div>
  );
};
