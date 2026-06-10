const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL

const connectDB = async() => {
    try {
        await mongoose.connect(MONGODB_URL)
        console.log(`Database connected Successfully`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = connectDB;