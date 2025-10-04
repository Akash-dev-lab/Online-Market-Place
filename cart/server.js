require("dotenv").config();

const app = require('./src/app');
const connectDB = require('./src/db/db');

connectDB();

app.listen(process.env.MONGO_URI, () => {
  console.log('Cart service is running on port 3002');
});