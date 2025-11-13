const express = require('express');
const cookieParser = require('cookie-parser');
const paymentRoutes = require('./routes/payment.routes')
const cors = require('cors');

const app = express()

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Payment service is running"
    });
})

app.use("/api/payments/", paymentRoutes)

module.exports = app