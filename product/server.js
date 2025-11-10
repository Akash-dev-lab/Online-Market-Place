require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const {connect} = require("./src/broker/broker")

app.get("/health", (_req, res) => res.status(200).send("OK"));

(async () => {
  try {
    await connectDB();
    await connect();

    const PORT = Number(process.env.PORT || 3001);
    const HOST = "0.0.0.0";               // <- IMPORTANT for ALB

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });

    // graceful shutdown (optional but good)
    const shutdown = () => server.close(() => process.exit(0));
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();