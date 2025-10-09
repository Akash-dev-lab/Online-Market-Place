require("dotenv").config()
const app = require("./src/app")
const http = require('http')

const {initSocketServer} = require("./src/socket/socket.server")

const httpServer = http.createServer(app)

initSocketServer(httpServer)

httpServer.listen(process.env.PORT, () => {
    console.log("AI Buddy Service is running on port 3005")
})