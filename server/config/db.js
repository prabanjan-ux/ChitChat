const mongoose = require('mongoose');
require('dotenv').config()

const dbURI = process.env.MONGO_URI ||  'mongodb://localhost:27017/ChitChat';

const connectDB = async() => {
    try{
        await mongoose.connect(dbURI);
        console.log('Mongo connected successfully')
    }catch(err){
        console.error('Mongo Connection error',err.message);
        process.exit(1);
    }
};

module.exports = connectDB;