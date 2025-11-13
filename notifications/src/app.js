const express = require('express')
const {connect} = require("./broker/broker")
const setListeners = require("./broker/listener")
const cors = require('cors');

const app = express()

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

connect().then(()=>{
    setListeners()
})

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Notification service is running"
    });
})


module.exports = app