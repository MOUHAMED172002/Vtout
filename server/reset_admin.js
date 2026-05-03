import "dotenv/config";
import sequelize from "./config/database.js";
import { hash } from "@node-rs/argon2"; // Better Auth uses argon2

async function resetAdmin() {
    try {
        const email = "abdoul172002@gmail.com"; // One of the admin emails
        const newPassword = "AdminVtout2026!"; // A strong temporary password
        
        console.log(`Resetting password for ${email}...`);

        const [users] = await sequelize.query("SELECT id FROM user WHERE email = :email", {
            replacements: { email }
        });
        
        if (users.length === 0) {
            console.error("User not found.");
            return;
        }

        const userId = users[0].id;
        const hashedPassword = await hash(newPassword);

        await sequelize.query(
            "UPDATE account SET password = :password WHERE userId = :userId AND providerId = 'email'",
            {
                replacements: { password: hashedPassword, userId }
            }
        );

        console.log("✅ Password successfully reset to: " + newPassword);
        console.log("Please log in and change it immediately.");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await sequelize.close();
    }
}

resetAdmin();
