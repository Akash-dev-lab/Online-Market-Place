const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const agent = require("../agent/agent");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    path: "/api/socket/socket.io",
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers?.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};

    console.log("🍪 Incoming Cookie:", cookies);
    console.log("🔐 Parsed Token:", token);

    if (!token) return next(new Error("Token Not Provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded;
      socket.token = token;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user);

    socket.on("message", async (data) => {
      console.log("📨 Received:", data);

      const agentResponse = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: data
            }
          ]
        },
        {
          metadata: {
            token: socket.token
          }
        }
      );

      const finalResponse = agentResponse.messages.at(-1);
      console.log("🤖 AI Response:", finalResponse);

      // Send response back to client (Postman / frontend)
      socket.emit("ai-response", finalResponse);
    });
  });
}

module.exports = { initSocketServer };
