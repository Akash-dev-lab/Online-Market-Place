const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const productRoutes = require("./routes/product.routes");

app.use(express.json());
app.use(cookieParser());

app.use("/api/products/", productRoutes)


module.exports = app;