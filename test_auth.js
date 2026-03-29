const axios = require("axios");

async function testAuthPost() {
    try {
        console.log("Testing POST /api/auth/sign-in/email");
        const res = await axios.post("http://localhost:3000/api/auth/sign-in/email", {
            email: "test@example.com",
            password: "password"
        });
        console.log("Response:", res.status, res.data);
    } catch (e) {
        if (e.response) {
            console.log("Error status:", e.response.status);
            console.log("Error body:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("Request error:", e.message);
        }
    }
}

testAuthPost();
