const express = require('express');
const cartRoutes = require('./routes/cart.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/cart/', cartRoutes);


module.exports = app;