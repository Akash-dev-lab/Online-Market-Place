const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const productRoutes = require("./routes/product.routes");
const cors = require('cors');

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Product service is running"
    });
})

app.use("/api/products/", productRoutes)


module.exports = app;