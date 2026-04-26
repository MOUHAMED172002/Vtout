import "dotenv/config";
import { auth } from "./config/auth.js";

async function verifyAuth() {
    try {
        console.log("Checking BetterAuth configuration...");
        console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
        console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
        
        const session = await auth.api.getSession({
            headers: new Headers()
        });
        console.log("Session check ok");
    } catch (error) {
        console.error("BetterAuth Verification Failed:", error);
    }
}

verifyAuth();
