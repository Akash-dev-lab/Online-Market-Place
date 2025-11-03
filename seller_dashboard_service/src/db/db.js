const mongoose = require('mongoose')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("DB is Connected.")
    })
    } catch (error) {
        console.log("Error while connecting DB...", error)
    }
}

module.exports = connectDB