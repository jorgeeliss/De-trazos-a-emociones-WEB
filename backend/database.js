const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Si se usa MongoDB Atlas, la URI de conexión debe reemplazarse aquí
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/emocionesDB");
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error de conexión a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
