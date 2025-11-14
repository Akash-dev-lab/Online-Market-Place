const express = require('express')
const cookieParser = require("cookie-parser");
const sellerRoutes = require('./routes/seller.routes')
const cors = require('cors');

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Seller Dashboard Service is running.' });
});

app.use('/api/seller/dashboard', sellerRoutes)


module.exports = app