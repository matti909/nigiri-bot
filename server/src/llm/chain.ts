import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { z } from "zod";

dotenv.config();

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0,
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const vectorStore = new MemoryVectorStore(embeddings);

const loader = new TextLoader("src/data/menu.txt");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const initializeChain = async () => {
  const docs = await loader.load();
  const allSplits = await splitter.splitDocuments(docs);

  await vectorStore.addDocuments(allSplits);

  const retrieveSchema = z.object({ query: z.string() });

  const botStepsSchema = z.object({
    query: z
      .enum(["hola", "finalizar pedido"])
      .describe("Acción específica del bot."),
    order: z
      .object({
        items: z
          .array(
            z.object({
              name: z.string().describe("Nombre del ítem."),
              price: z.number().describe("Precio del ítem."),
              quantity: z.number().min(1).describe("cantidad de este item"),
            })
          )
          .describe("Lista de ítems en el pedido."),
      })
      .optional()
      .describe("Detalles del pedido, requeridos para finalizarlo."),
  });

  const botSteps = tool(
    async ({ query, order }) => {
      if (query === "hola") {
        return "¡Hola! Soy Sushi Bot, tu asistente especializado en nuestro restaurante de sushi. ¿En qué puedo ayudarte hoy?";
      }

      if (query === "finalizar pedido") {
        if (!order || !order.items || order.items.length === 0) {
          return "No se proporcionaron los detalles del pedido. Por favor, especifica los ítems con sus nombres y precios.";
        }

        // Formatear detalles del pedido para la respuesta
        const formattedItems = order.items.map(
          (item) =>
            `- ${item.name}: $${item.price.toFixed(2)} x${item.quantity}`
        );

        return {
          status: "success",
          message:
            "Gracias por tu pedido. Lo estamos procesando y te confirmaremos los detalles en breve.",
          orderDetails: {
            items: formattedItems,
          },
        };
      }

      return "No se reconoce la acción solicitada.";
    },
    {
      name: "botSteps",
      description:
        "Handle specific steps of the Sushi Bot, including order finalization.",
      schema: botStepsSchema,
    }
  );

  const retrieve = tool(
    async ({ query }) => {
      const retrievedDocs = await vectorStore.similaritySearch(query!, 2);
      const serialized = retrievedDocs
        .map(
          (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
        )
        .join("\n");
      return [serialized, retrievedDocs];
    },
    {
      name: "retrieve",
      description: "Retrieve information related to a query.",
      schema: retrieveSchema,
      responseFormat: "content_and_artifact",
    }
  );

  const tools2 = [retrieve, botSteps];
  const tools = new ToolNode(tools2);

  async function queryOrRespond(state: typeof MessagesAnnotation.State) {
    const llmWithTools = llm.bindTools(tools2);
    const response = await llmWithTools.invoke(state.messages);

    return { messages: [response] };
  }

  async function generate(state: typeof MessagesAnnotation.State) {
    let recentToolMessages = [];
    for (let i = state["messages"].length - 1; i >= 0; i--) {
      let message = state["messages"][i];
      if (message instanceof ToolMessage) {
        recentToolMessages.push(message);
      } else {
        break;
      }
    }
    let toolMessages = recentToolMessages.reverse();

    // Format into prompt
    const docsContent = toolMessages.map((doc) => doc.content).join("\n");
    const systemMessageContent =
      `
        Eres Sushi bot un asistente especializado en ayudar a los clientes de un restaurante Arigato!. 
        Debes mostrar el menu que tienes en memoria cuando te lo pidan. solo existe ese menu. debes presentarte como sushi bot.
        Tus funciones principales son:
        1. Mostrar el menú cuando el cliente lo solicite.
        2. Tomar pedidos de manera estructurada.
        3. Confirmar el pedido al cliente y responder preguntas sobre los productos.
        
        Cuando el cliente pida el menú, responde con el contenido del menú predefinido. 
        Si el cliente hace un pedido, asegúrate de confirmarlo y registrar cada ítem correctamente.
        Si no entiendes algo, pide una aclaración al cliente.
        
        Recuerda: 
        - Recuerda que en tu primer interaccion debe ser presentandote como sushi
        - Usa un tono amable y profesional.
        - Registra los pedidos en formato estructurado para que puedan ser procesados.
        - Siempre confirma con el cliente antes de cerrar el pedido.

          Aquí tienes el contenido relevante del menú:
      ` +
      "\n\n" +
      `${docsContent}`;

    const conversationMessages = state.messages.filter(
      (message) =>
        message instanceof HumanMessage ||
        message instanceof SystemMessage ||
        (message instanceof AIMessage && message.tool_calls!.length == 0)
    );
    const prompt = [
      new SystemMessage(systemMessageContent),
      ...conversationMessages,
    ];

    const response = await llm.invoke(prompt);

    return { messages: [response] };
  }

  const graphBuilder = new StateGraph(MessagesAnnotation)
    .addNode("queryOrRespond", queryOrRespond)
    .addNode("tools", tools)
    .addNode("generate", generate)
    .addEdge("__start__", "queryOrRespond")
    .addConditionalEdges("queryOrRespond", toolsCondition, {
      __end__: "__end__",
      tools: "tools",
    })
    .addEdge("tools", "generate")
    .addEdge("generate", "__end__");

  return graphBuilder.compile({ checkpointer: new MemorySaver() });
};
