require("dotenv").config();
const app = require("../product/src/app");
const connectDB = require("../product/src/db/db");
const {connect} = require("./src/broker/broker")

connectDB();
connect()

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3001");
});