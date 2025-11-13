const express = require('express')
const cors = require('cors');

const app = express()

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "AI service is running"
    });
});

module.exports = app