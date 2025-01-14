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
    <div className="grid grid-cols-2 place-items-center p-4">
      <h1 className="text-2xl font-bold">Nigiri Chatbot</h1>

      <section>
        <Orders error={error!} order={order} />
      </section>

      <section>
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
      </section>
    </div>
  );
};

export default App;
