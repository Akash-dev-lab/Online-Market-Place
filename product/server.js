require("dotenv").config();
const app = require("../product/src/app");
const connectDB = require("../product/src/db/db");

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3001");
});