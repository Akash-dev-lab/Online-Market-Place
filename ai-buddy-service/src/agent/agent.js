const {StateGraph, MessagesAnnotation } = require("@langchain/langgraph")
const {ChatGoogleGenerativeAI} = require("@langchain/google-genai")
const {ToolMessage, AIMessage, HumanMessage} = require("@langchain/core/messages")
const tools = require('./Tools')


const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    temperature: 0.5,
    apiKey: process.env.GEMINI_API_KEY
})

const graph = new StateGraph(MessagesAnnotation)

    // --------------------------- TOOLS NODE ---------------------------

        .addNode('tools', async (state, config) => {

    const lastMessage = state.messages[state.messages.length-1]

    const toolsCall = lastMessage.tool_calls || []

    console.log("🧠 Tool calls received:", toolsCall);

    const toolCallResults = await Promise.all(toolsCall.map(async (call) => {
        const tool = tools[call.name]

        if(!tool) throw new Error(`Tool ${call.name} not found`)
        
        const toolInput = call.args
        console.log(`⚙️ Invoking tool: ${call.name}`, toolInput);

        const toolResult = await tool.invoke(toolInput, { metadata: { token: config.metadata?.token } } )
            console.log(`✅ Tool result:`, toolResult);

        return new ToolMessage({content: toolResult, toolName: call.name})
    }))

    state.messages.push(...toolCallResults)
    })

     // --------------------------- CHAT NODE ---------------------------
        .addNode('chat', async (state, config) => {
        const response = await model.invoke(state.messages, {tools: [tools.searchProduct, tools.addProductToCart]})

        console.log("💬 Model response:", response);

        state.messages.push(new AIMessage({content: response.text, tool_calls: response.tool_calls}))

        return state
    })

    // --------------------------- GRAPH EDGES ---------------------------
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", async (state) => {
        const lastMessage = state.messages[state.messages.length-1]

        if(lastMessage.tool_calls && lastMessage.tool_calls.length > 0) return "tools"
        else return "__end__"
    })
    .addEdge("tools", "chat")


const agent = graph.compile()

module.exports = agent