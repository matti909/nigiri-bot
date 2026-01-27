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
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto px-6 py-4 min-h-screen bg-transparent text-sushi-text">
      {/* Chat Section - Ocupa la mayor parte del espacio */}
      <section className="flex-1 flex flex-col min-h-screen lg:min-h-0">
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

      {/* Orders Sidebar - Más compacta */}
      <aside className="lg:w-96 shrink-0">
        <Orders
          error={error!}
          order={order}
          handleReset={handleReset}
          orderCreatedTrigger={orderCreatedTrigger}
        />
      </aside>
    </div>
  );
};

export default App;
