require("dotenv").config({ override: true });
const { auth } = require("./config/auth");

async function test() {
    try {
        await auth.api.getSession({ headers: new Headers() });
        console.log("Success");
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
        console.error("STACK:", e.stack);
        console.error("CAUSE:", e.cause);
        console.error("ORIGINAL:", e.original);
    }
}
test();
