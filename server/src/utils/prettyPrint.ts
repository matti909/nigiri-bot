import { BaseMessage, isAIMessage, AIMessage } from "@langchain/core/messages";

const prettyPrint = (message: BaseMessage) => {
  let txt = `[${message._getType()}]: ${message.content}`;

  // Verificar si el mensaje tiene tool calls
  if (isAIMessage(message) && message.tool_calls && message.tool_calls.length > 0) {
    const aiMessage = message as AIMessage;
    const tool_calls = aiMessage.tool_calls
      ?.map((tc: any) => `- ${tc.name}(${JSON.stringify(tc.args)})`)
      .join("\n");
    txt += ` \nTools: \n${tool_calls}`;
  }

  console.log(txt);
  return txt;
};

export { prettyPrint };
