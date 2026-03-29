const { betterAuth } = require("better-auth");
const { Resend } = require("resend");
const mysql = require("mysql2");
const { Kysely, MysqlDialect } = require("kysely");

// Configuration de Resend pour les emails transactionnels
const resend = new Resend(process.env.RESEND_API_KEY || "replace_me_if_not_in_env");

const MYSQL_DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'eshop_db'}`;
const pool = mysql.createPool(MYSQL_DATABASE_URL);

const db = new Kysely({
    dialect: new MysqlDialect({
        pool
    })
});

const auth = betterAuth({
    database: {
        db, // Injection directe de Kysely, aucune résolution interne ne peut échouer.
        type: "mysql"
    },
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trustedOrigins: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:3000"],
    advanced: {
        crossSubDomainCookies: true
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // Envoi de l'e-mail de réinitialisation robuste via Resend
            await resend.emails.send({
                from: 'Vtout Security <security@vtout.com>', // À remplacer par votre domaine vérifié Resend
                to: [user.email],
                subject: 'Réinitialisez votre mot de passe Vtout',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                        <h2 style="color: #1a202c;">Sécurité Vtout</h2>
                        <p style="color: #4a5568;">Bonjour ${user.name || 'Utilisateur'},</p>
                        <p style="color: #4a5568;">Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte.</p>
                        <a href="${url}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #6366f1; font-weight: bold; text-decoration: none; border-radius: 8px; margin: 25px 0; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
                            Définir un nouveau mot de passe
                        </a>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #a0aec0; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message, votre compte est en sécurité.</p>
                    </div>
                `
            }).catch(console.error);
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID || '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user"
            }
        }
    }
});

module.exports = { auth };
