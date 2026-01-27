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
    handleReset,
    orderCreatedTrigger,
  } = useChatbot();

  return (
    <div className="flex flex-col sm:flex-row items-start max-w-[900px] mx-auto px-4 m-4 min-h-screen bg-transparent text-sushi-text">
      <section className="flex-1 h-auto">
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

      <section>
        <Orders
          error={error!}
          order={order}
          handleReset={handleReset}
          orderCreatedTrigger={orderCreatedTrigger}
        />
      </section>
    </div>
  );
};

export default App;
