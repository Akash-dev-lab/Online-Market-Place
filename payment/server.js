require('dotenv').config()
const app = require("./src/app")
const connectDB = require("./src/db/db")
const {connect} = require("./src/broker/broker")

connectDB()
connect()

app.listen(process.env.PORT, () => {
    console.log("Payment service is running on port 3004")
})