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
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">Chatbot</h1>
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
      {error && <p className="mt-2 text-red-500">Error: {error}</p>}
      {order && (
        <div className="p-2 mt-4 bg-gray-100 rounded border">
          <h2 className="font-bold">Items del Pedido:</h2>
          <ul>
            {order.map((item, index) => (
              <li key={index}>- {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
