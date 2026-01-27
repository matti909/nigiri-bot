import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import dotenv from "dotenv";
import { z } from "zod";
import { createNewOrder, getAllOrders } from "../services/order.service";

dotenv.config();

const llm = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: "claude-3-5-haiku-20241022",
  temperature: 0,
  maxTokens: 4096,
  maxRetries: 2,
});

const MENU = `# Menú Restaurante Arigato

## Rollos Clásicos
- California Roll: $150
- Philadelphia Roll: $170

## Rollos Especiales
- Dragon Roll: $200
- Spicy Tuna Roll: $210

## Bebidas
- Agua: $80
- Gaseosa: $100
- Sake: $250

## Postres
- Mochi Helado: $120
- Cheesecake de Té Verde: $150`;

const SYSTEM_PROMPT = `Eres Sushi Bot, asistente virtual del restaurante Arigato.

MENÚ DISPONIBLE:
${MENU}

TUS FUNCIONES:
1. Saluda amablemente cuando el cliente inicie conversación
2. Muestra el menú cuando lo soliciten
3. Ayuda a tomar pedidos de manera clara y estructurada
4. Confirma cada ítem con nombre, precio y cantidad antes de finalizar
5. Usa la herramienta "create_order" para guardar pedidos confirmados por el cliente
6. Usa "get_order_history" para mostrar pedidos anteriores cuando lo soliciten
7. Usa "calculate_total" para calcular el total de un pedido

INSTRUCCIONES:
- Sé amable y profesional en español
- Siempre confirma con el cliente antes de crear un pedido
- Si el cliente dice "quiero X", pregunta la cantidad antes de confirmar
- Solo usa create_order cuando el cliente confirme explícitamente su pedido
- Presenta los totales en pesos argentinos (ARS)
- Si no entiendes algo, pide aclaración`;

export const initializeChain = async () => {
  // Tool 1: Crear pedido en la base de datos
  const createOrderTool = tool(
    async ({ items, customerNote }) => {
      try {
        const order = await createNewOrder(items);
        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        return {
          success: true,
          orderId: order.id,
          total,
          itemCount: items.length,
          items: items.map(
            (item) =>
              `${item.name} x${item.quantity} - $${item.price * item.quantity}`,
          ),
          customerNote: customerNote || "Sin notas",
        };
      } catch (error) {
        return {
          success: false,
          error: `Error al crear el pedido: ${(error as Error).message}`,
        };
      }
    },
    {
      name: "create_order",
      description:
        "Guarda un pedido confirmado en la base de datos. Úsalo SOLO cuando el cliente confirme explícitamente su pedido completo.",
      schema: z.object({
        items: z
          .array(
            z.object({
              name: z.string().describe("Nombre del producto del menú"),
              price: z.number().describe("Precio unitario en ARS"),
              quantity: z
                .number()
                .min(1)
                .describe("Cantidad de unidades de este producto"),
            }),
          )
          .min(1)
          .describe("Lista de productos del pedido"),
        customerNote: z
          .string()
          .optional()
          .describe("Nota o comentario adicional del cliente"),
      }),
    },
  );

  // Tool 2: Obtener historial de pedidos
  const getOrderHistoryTool = tool(
    async ({ limit }) => {
      try {
        const orders = await getAllOrders();
        const recentOrders = orders.slice(0, limit || 10);

        if (recentOrders.length === 0) {
          return {
            success: true,
            message: "No hay pedidos registrados aún",
            orders: [],
          };
        }

        return {
          success: true,
          count: recentOrders.length,
          orders: recentOrders.map((order: any) => ({
            id: order.id,
            status: order.status,
            createdAt: new Date(order.createdAt).toLocaleString("es-AR"),
            items: order.items.map(
              (item: any) =>
                `${item.details.name} x${item.quantity} - $${item.details.price * item.quantity}`,
            ),
            total: order.items.reduce(
              (sum: number, item: any) =>
                sum + item.details.price * item.quantity,
              0,
            ),
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: `Error al obtener pedidos: ${(error as Error).message}`,
        };
      }
    },
    {
      name: "get_order_history",
      description:
        "Consulta los últimos pedidos realizados. Úsalo cuando el cliente pida ver su historial o pedidos anteriores.",
      schema: z.object({
        limit: z
          .number()
          .optional()
          .default(10)
          .describe("Cantidad máxima de pedidos a mostrar"),
      }),
    },
  );

  // Tool 3: Calcular total del pedido
  const calculateTotalTool = tool(
    async ({ items }) => {
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        total,
        itemCount,
        breakdown: items.map(
          (item) =>
            `${item.name} x${item.quantity}: $${item.price} c/u = $${item.price * item.quantity}`,
        ),
      };
    },
    {
      name: "calculate_total",
      description:
        "Calcula el total de un pedido. Úsalo cuando el cliente pregunte cuánto costaría su pedido.",
      schema: z.object({
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.number(),
              quantity: z.number().min(1),
            }),
          )
          .min(1),
      }),
    },
  );

  const tools = [createOrderTool, getOrderHistoryTool, calculateTotalTool];
  const toolNode = new ToolNode(tools);

  async function agent(state: typeof MessagesAnnotation.State) {
    const systemMessage = new SystemMessage(SYSTEM_PROMPT);
    const messages = [systemMessage, ...state.messages];

    const llmWithTools = llm.bindTools(tools);
    const response = await llmWithTools.invoke(messages);

    return { messages: [response] };
  }

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", agent)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", toolsCondition, {
      tools: "tools",
      __end__: "__end__",
    })
    .addEdge("tools", "agent");

  return graph.compile({ checkpointer: new MemorySaver() });
};
