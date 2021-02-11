const mongoose = require('mongoose');

async function connectDB() {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log(`Connected to Database `)
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB