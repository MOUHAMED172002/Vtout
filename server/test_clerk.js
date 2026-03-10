console.log("Starting Clerk test...");
try {
    console.log("Attempting to require @clerk/clerk-sdk-node...");
    const clerk = require('@clerk/clerk-sdk-node');
    console.log("Clerk required successfully!");
    console.log("Clerk exported keys:", Object.keys(clerk));
} catch (err) {
    console.error("Error requiring Clerk:", err);
}
console.log("Clerk test finished.");
process.exit(0);
