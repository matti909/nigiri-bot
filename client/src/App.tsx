import { ChatInput, Conversations, Orders } from "./components";
import { useChatbot } from "./hooks";

const App = () => {
  const {
    conversations,
    userMessage,
    setUserMessage,
    handleSubmit,
    loading,
    error,
    order,
    aiMessage,
  } = useChatbot();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">Nigiri Chatbot</h1>

      <Conversations
        aiMessage={aiMessage}
        conversations={conversations}
        loading={loading}
      />

      <ChatInput
        handleSubmit={handleSubmit}
        setUserMessage={setUserMessage}
        userMessage={userMessage}
        loading={loading}
      />

      <Orders error={error!} order={order} />
    </div>
  );
};

export default App;
