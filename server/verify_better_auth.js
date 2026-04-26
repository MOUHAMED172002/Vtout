const { auth } = require("./config/auth");
require("dotenv").config();

async function verify() {
    try {
        console.log("Checking Better Auth configuration...");
        console.log("Base URL:", auth.options.baseURL);
        
        // Attempt to get session (this will check DB connection)
        console.log("Attempting to query DB via Better Auth...");
        const session = await auth.api.getSession({
            headers: new Headers()
        });
        console.log("Auth API is responsive.");
        
        // Check if tables exist by trying a simple query if possible, 
        // or just rely on the above check.
        
        console.log("Better Auth seems to be configured correctly.");
        process.exit(0);
    } catch (err) {
        console.error("Better Auth verification failed!");
        console.error(err);
        process.exit(1);
    }
}

verify();
