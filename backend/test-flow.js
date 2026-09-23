const axios = require("axios");

async function testFlow() {
    try {
        const randomEmail = `test${Date.now()}@test.com`;
        
        console.log("1. Registering new user...");
        const regRes = await axios.post("http://localhost:3000/auth/register", {
            nombre: "Test",
            apellido: "User",
            email: randomEmail,
            password: "password123",
            rol: "padre"
        });
        console.log("Register Response:", regRes.data);

        console.log("\n2. Logging in...");
        const loginRes = await axios.post("http://localhost:3000/auth/login", {
            email: randomEmail,
            password: "password123"
        });
        console.log("Login Response:", loginRes.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testFlow();
