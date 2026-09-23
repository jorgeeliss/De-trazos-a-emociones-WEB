const fetch = require("node-fetch");

async function test() {
    const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "jesusmartinez@gmail.com", password: "password" })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
}

test().catch(console.error);
