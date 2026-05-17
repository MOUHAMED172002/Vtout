import { betterAuth } from "better-auth";
import { Resend } from "resend";
import mysql from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const MYSQL_DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'eshop_db'}`;

// MySQL 8.4 uses caching_sha2_password by default.
// allowPublicKeyRetrieval lets the driver do RSA key exchange without SSL.
const pool = mysql.createPool({
    uri: MYSQL_DATABASE_URL,
    allowPublicKeyRetrieval: true,
    ssl: false,
});

const db = new Kysely({
    dialect: new MysqlDialect({
        pool
    })
});

// Lit la config email depuis la DB (priorité) ou le .env (fallback)
// Appelé à chaque envoi → prend en compte les modifications faites via l'admin sans redémarrage
const getEmailConfig = async () => {
    try {
        const [rows] = await pool.promise().query(
            "SELECT `key`, value FROM configs WHERE `group` = 'email'"
        );
        const map = {};
        (Array.isArray(rows) ? rows : []).forEach(r => { map[r.key] = r.value; });
        return {
            apiKey:      map['RESEND_API_KEY']    || process.env.RESEND_API_KEY,
            fromName:    map['MAIL_FROM_NAME']    || 'Vtout',
            fromAddress: map['MAIL_FROM_ADDRESS'] || 'onboarding@resend.dev',
        };
    } catch {
        return {
            apiKey:      process.env.RESEND_API_KEY,
            fromName:    'Vtout',
            fromAddress: 'onboarding@resend.dev',
        };
    }
};

// Build a broad list of trusted origins covering localhost, WSL2/LAN IPs, and any explicit extras
const DEV_PORTS = [5173, 5174, 5175, 5176, 5177, 3000, 3001];
const LAN_HOSTS = [
    'localhost', '127.0.0.1',
    '172.30.0.1',  // WSL2 host gateway (most common)
    '172.29.0.1',
    '172.16.0.1',
    '192.168.1.1',
];

// Generate origin strings for all combinations of host × port
const generatedOrigins = LAN_HOSTS.flatMap(host =>
    DEV_PORTS.map(port => `http://${host}:${port}`)
);

const allTrustedOrigins = [
    ...new Set([
        ...generatedOrigins,
        ...(process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim().replace(/\/$/, '')),
        ...(process.env.EXTRA_ORIGINS || '').split(',').map(o => o.trim().replace(/\/$/, '')),
        (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
        (process.env.ADMIN_URL || '').replace(/\/$/, ''),
        (process.env.BETTER_AUTH_URL || '').replace(/\/$/, '').replace('/api/auth', ''),
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ])
].filter(Boolean);


export const auth = betterAuth({
    database: {
        db, 
        type: "mysql"
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth",
    trustedOrigins: allTrustedOrigins,
    advanced: {
        crossSubDomainCookies: true
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendResetPassword: async ({ user, url }, request) => {
            try {
                const cfg = await getEmailConfig();
                if (!cfg.apiKey) {
                    console.warn('[Auth] No RESEND_API_KEY — reset email not sent.');
                    return;
                }
                const resend = new Resend(cfg.apiKey);
                const info = await resend.emails.send({
                    from: `${cfg.fromName} Security <${cfg.fromAddress}>`,
                    to: [user.email],
                    subject: 'Réinitialisez votre mot de passe Vtout',
                    html: `
                        <div style="font-family:sans-serif;max-width:540px;margin:auto;padding:40px;border-radius:24px;border:1px solid #e2e8f0;">
                            <div style="background:#0f172a;padding:24px;border-radius:16px;text-align:center;margin-bottom:28px;">
                                <span style="font-size:28px;font-weight:900;letter-spacing:-1px;">
                                    <span style="color:#0054a6;">v</span><span style="color:#f37021;">tout</span>
                                </span>
                            </div>
                            <h2 style="color:#0f172a;font-size:22px;font-weight:900;margin-bottom:8px;">Réinitialisation de mot de passe</h2>
                            <p style="color:#64748b;font-size:15px;">Bonjour <strong>${user.name || user.email}</strong>,</p>
                            <p style="color:#64748b;font-size:15px;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
                            <div style="text-align:center;margin:32px 0;">
                                <a href="${url}" style="background:#f37021;color:white;padding:16px 36px;border-radius:14px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block;">
                                    Changer mon mot de passe
                                </a>
                            </div>
                            <p style="color:#94a3b8;font-size:12px;text-align:center;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
                            <div style="border-top:1px solid #f1f5f9;margin-top:24px;padding-top:16px;text-align:center;">
                                <p style="color:#cbd5e1;font-size:11px;">Vtout &mdash; La boutique en ligne au Bénin</p>
                            </div>
                        </div>
                    `
                });
                if (info.error) {
                    console.error('[Auth] Resend error details:', info.error);
                } else {
                    console.log('[Auth] Reset email sent successfully to:', user.email);
                }
            } catch (err) {
                console.error('[Auth] sendResetPassword exception:', err);
            }
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }, request) => {
            try {
                const cfg = await getEmailConfig();
                if (!cfg.apiKey) {
                    console.warn('[Auth] No RESEND_API_KEY — verification email not sent.');
                    return;
                }
                const resend = new Resend(cfg.apiKey);
                const firstName = (user.name || user.email).split(' ')[0];
                
                const html = `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:0;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
                    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:40px 40px 30px;text-align:center;">
                        <div style="display:inline-block;background:rgba(255,255,255,0.1);border-radius:16px;padding:12px 20px;margin-bottom:20px;">
                            <span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Vtout Platform</span>
                        </div>
                        <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">Vérifiez votre email</h1>
                    </div>
                    <div style="padding:40px;">
                        <p style="color:#475569;font-size:16px;margin:0 0 20px;">Bonjour <strong style="color:#0f172a;">${firstName}</strong>,</p>
                        <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 30px;">
                            Pour finaliser la sécurisation de votre compte Vtout, cliquez sur le bouton ci-dessous :
                        </p>
                        <div style="text-align:center;margin:30px 0;">
                            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;padding:16px 40px;border-radius:14px;text-decoration:none;font-weight:800;font-size:15px;">
                                ✉️ Vérifier mon adresse email
                            </a>
                        </div>
                    </div>
                </div>`;

                const info = await resend.emails.send({
                    from: `${cfg.fromName} Security <${cfg.fromAddress}>`,
                    to: [user.email],
                    subject: '✉️ Confirmez votre adresse email Vtout',
                    html
                });
                
                if (info.error) {
                    console.error('[Auth] Verification Resend error:', info.error);
                } else {
                    console.log('[Auth] Verification email sent successfully to:', user.email);
                }
            } catch (err) {
                console.error('[Auth] sendVerificationEmail exception:', err);
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
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
console.log('[auth] BetterAuth initialized.');

