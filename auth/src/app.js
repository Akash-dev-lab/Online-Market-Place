const express = require('express')
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes")
const cors = require('cors');

const app = express()

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.status(200).json({
    message: "Auth service is running"
  });
})

app.use("/api/auth", authRoutes)


module.exports = app