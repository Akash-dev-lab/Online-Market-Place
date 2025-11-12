// socket.server.js (fixed)
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const agent = require("../agent/agent");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    // IMPORTANT: do NOT use trailing slash here
    path: "/api/socket/socket.io",
    // allow both transports
    transports: ["websocket", "polling"],
    // allow ALB + browser CORS - restrict origin in prod
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // authentication via cookie (you already parse cookie)
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers?.cookie;
      const { token } = cookies ? cookie.parse(cookies) : {};

      console.log("🍪 Incoming Cookie:", cookies);
      console.log("🔐 Parsed Token:", token);

      if (!token) return next(new Error("Token Not Provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded;
      socket.token = token;
      next();
    } catch (err) {
      console.error("Auth error:", err && err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user?.id || socket.user);

    socket.on("message", async (data) => {
      try {
        console.log("📨 Received:", data);

        const agentResponse = await agent.invoke(
          {
            messages: [{ role: "user", content: data }]
          },
          {
            metadata: { token: socket.token }
          }
        );

        // get last message safely
        const lastMessage = agentResponse.messages?.at(-1);
        console.log("🤖 AI Response (raw):", lastMessage);

        // emit whole object or content depending on structure
        socket.emit("ai-response", lastMessage?.content ?? lastMessage);
      } catch (err) {
        console.error("Agent error:", err);
        socket.emit("ai-error", { message: "AI agent failed" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", reason);
    });
  });
}

module.exports = { initSocketServer };
