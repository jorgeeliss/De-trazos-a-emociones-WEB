require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const u = await User.findOne({ email: "test1788557348868@test.com" });
    console.log("Found user:", u);
    process.exit(0);
}).catch(console.error);
