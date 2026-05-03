import "dotenv/config";
import sequelize from "./config/database.js";

async function checkAdmin() {
    try {
        const emails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        console.log("Checking admins:", emails);

        for (const email of emails) {
            const [users] = await sequelize.query("SELECT * FROM user WHERE email = :email", {
                replacements: { email }
            });
            
            if (users.length > 0) {
                console.log(`User found: ${email} (ID: ${users[0].id})`);
                const [accounts] = await sequelize.query("SELECT id, providerId FROM account WHERE userId = :userId", {
                    replacements: { userId: users[0].id }
                });
                if (accounts.length > 0) {
                    console.log(`  Account found: ${accounts[0].providerId}`);
                } else {
                    console.log(`  No account found for this user!`);
                }
            } else {
                console.log(`User not found: ${email}`);
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await sequelize.close();
    }
}

checkAdmin();
