import { Resend } from 'resend';
import 'dotenv/config';
import { Config } from '../models/index.js';

/**
 * Get email config: DB values take priority over .env
 */
const getEmailConfig = async () => {
    try {
        const configs = await Config.findAll({ where: { group: 'email' } });
        const map = {};
        configs.forEach(c => { map[c.key] = c.value; });
        return {
            apiKey: map['RESEND_API_KEY'] || process.env.RESEND_API_KEY,
            fromName: map['MAIL_FROM_NAME'] || 'Vtout',
            fromAddress: map['MAIL_FROM_ADDRESS'] || 'onboarding@resend.dev',
            adminEmail: map['ADMIN_NOTIF_EMAIL'] || process.env.ADMIN_NOTIF_EMAIL || process.env.ADMIN_EMAILS?.split(',')[0]
        };
    } catch {
        return {
            apiKey: process.env.RESEND_API_KEY,
            fromName: 'Vtout',
            fromAddress: 'onboarding@resend.dev',
            adminEmail: process.env.ADMIN_NOTIF_EMAIL || process.env.ADMIN_EMAILS?.split(',')[0]
        };
    }
};

/**
 * Generate invoice HTML template
 */
const generateInvoiceTemplate = (order, items) => {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Produit'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.price).toLocaleString('fr-FR')} F</td>
        </tr>
    `).join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Reçus - Commande #${order.id.slice(0, 8)}</h2>
        <p>Bonjour <strong>${order.guest_name || 'Client'}</strong>,</p>
        <p>Merci pour votre commande sur notre boutique. Voici les détails de votre achat :</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background-color: #f8f8f8;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Qté</th>
                    <th style="padding: 10px; text-align: right;">Prix</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">
            Total: ${Number(order.total_amount).toLocaleString('fr-FR')} F
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background-color: #fff9eb; border: 1px solid #ffeeba; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Code de validation de livraison :</strong></p>
            <h1 style="margin: 10px 0 0 0; color: #856404; font-size: 32px; letter-spacing: 5px;">${order.delivery_code || '----'}</h1>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #856404;">Veuillez communiquer ce code au livreur uniquement lorsque vous recevez vos articles.</p>
        </div>
        
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777; text-align: center;">
            Cette facture a été générée automatiquement. Si vous avez des questions, contactez notre support.
        </p>
    </div>
    `;
};

/**
 * Templates de mails premium
 */
const templates = {
    orderAdmin: (order) => `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border-radius: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background-color: #0f172a; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Nouvelle Commande !</h2>
            </div>
            <p style="color: #475569; font-size: 16px;">Une nouvelle commande vient d'être passée sur la plateforme.</p>
            <div style="background-color: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <p style="margin: 0 0 10px 0;"><strong>ID Commande:</strong> #${order.id.slice(0, 8)}</p>
                <p style="margin: 0 0 10px 0;"><strong>Client:</strong> ${order.guest_name || 'Inconnu'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Total:</strong> <span style="color: #0f172a; font-weight: 800; font-size: 18px;">${Number(order.total_amount).toLocaleString()} F</span></p>
                <p style="margin: 0 0 10px 0;"><strong>Paiement:</strong> ${order.payment_method === 'delivery' ? 'À la livraison' : 'En ligne'}</p>
                <p style="margin: 0;"><strong>Code OTP:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${order.delivery_code || '----'}</span></p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.ADMIN_URL || '#'}/admin/dashboard/orders" style="background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">Gérer la commande</a>
            </div>
        </div>
    `,
    statusUpdate: (order, statusLabel) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 22px;">Votre commande évolue !</h2>
            <p style="color: #64748b;">Bonjour ${order.guest_name || 'Client'}, le statut de votre commande <strong>#${order.id.slice(0, 8)}</strong> est désormais :</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; font-weight: bold; color: #0f172a; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
                ${statusLabel}
            </div>
            <p style="color: #64748b; margin-top: 20px;">Merci de votre confiance.</p>
        </div>
    `,
    productApproval: (product, status, feedback) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border-radius: 24px; background-color: ${status === 'approved' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${status === 'approved' ? '#bbf7d0' : '#fecaca'};">
            <h2 style="color: #0f172a;">Mise à jour de votre produit</h2>
            <p>Votre produit <strong>${product.name}</strong> a été <strong>${status === 'approved' ? 'APPROUVÉ' : 'REFUSÉ'}</strong> par l'administrateur.</p>
            ${feedback ? `<div style="background-color: white; padding: 15px; border-radius: 12px; margin-top: 15px; border: 1px dashed #cbd5e1;"><strong>Note de l'admin:</strong> ${feedback}</div>` : ''}
            <div style="margin-top: 25px;">
                <a href="${process.env.FRONTEND_URL || '#'}/fournisseur/dashboard" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">Accéder au tableau de bord</a>
            </div>
        </div>
    `,
    supplierApproval: (supplier, status) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border-radius: 24px; background-color: ${status === 'active' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${status === 'active' ? '#bbf7d0' : '#fecaca'};">
            <h2 style="color: #0f172a;">${status === 'active' ? 'Bienvenue parmi nos partenaires !' : 'Mise à jour de votre compte'}</h2>
            <p>Bonjour <strong>${supplier.name}</strong>,</p>
            <p>Votre compte fournisseur sur notre plateforme est désormais <strong>${status === 'active' ? 'ACTIF' : 'SUSPENDU'}</strong>.</p>
            ${status === 'active' ? '<p>Vous pouvez dès à présent ajouter vos produits et commencer à vendre.</p>' : '<p>Veuillez contacter l\'administration pour plus de détails.</p>'}
            <div style="margin-top: 25px;">
                <a href="${process.env.FRONTEND_URL || '#'}/fournisseur/dashboard" style="background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">Accéder au portail</a>
            </div>
        </div>
    `
};

/**
 * Envoi mail général (lit config DB en temps réel)
 */
const sendMail = async (to, subject, html) => {
    const cfg = await getEmailConfig();
    if (!cfg.apiKey) {
        console.warn('[Mail] No RESEND_API_KEY found. Email not sent.');
        return { success: false, error: 'Resend not configured' };
    }
    const resend = new Resend(cfg.apiKey);
    try {
        const { data, error } = await resend.emails.send({
            from: `${cfg.fromName} <${cfg.fromAddress}>`,
            to,
            subject,
            html,
        });
        if (error) {
            console.error('[Mail] Resend error:', error);
            return { success: false, error };
        }
        console.log('[Mail] Email sent successfully to:', to);
        return { success: true, data };
    } catch (error) {
        console.error('[Mail] Critical Error:', error);
        return { success: false, error };
    }
};

export const sendOrderNotificationToAdmin = async (order) => {
    const cfg = await getEmailConfig();
    const adminEmail = cfg.adminEmail;
    return sendMail(adminEmail, `🚀 Nouvelle Commande #${order.id.slice(0, 8)}`, templates.orderAdmin(order));
};

export const sendOrderUpdateToCustomer = async (order, statusLabel) => {
    const email = order.guest_email || order.user_email;
    if (!email) return;
    return sendMail(email, `📦 Commande #${order.id.slice(0, 8)} : ${statusLabel}`, templates.statusUpdate(order, statusLabel));
};

export const sendProductApprovalNotification = async (supplierEmail, product, status, feedback) => {
    if (!supplierEmail) return;
    const subject = status === 'approved' ? '✅ Produit Approuvé' : '❌ Produit Refusé';
    return sendMail(supplierEmail, subject, templates.productApproval(product, status, feedback));
};

export const sendSupplierApprovalNotification = async (supplierEmail, supplier, status) => {
    if (!supplierEmail) return;
    const subject = status === 'active' ? '✅ Compte Fournisseur Approuvé' : '⚠️ Compte Fournisseur Suspendu';
    return sendMail(supplierEmail, subject, templates.supplierApproval(supplier, status));
};

export const sendInvoiceEmail = async (order, items) => {
    const email = order.guest_email || order.user_email;
    if (!email) return;
    return sendMail(email, `🧾 Votre Reçus - Commande #${order.id.slice(0, 8)}`, generateInvoiceTemplate(order, items));
};

/**
 * Test email - send a simple test email to verify config
 */
export const sendTestEmail = async (to) => {
    return sendMail(to, '✅ Test Email Vtout', `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:40px;border-radius:20px;border:1px solid #e2e8f0;">
            <h2 style="color:#0f172a;">Email de test Vtout ✅</h2>
            <p style="color:#475569;">Si vous recevez cet email, votre configuration Resend est opérationnelle !</p>
            <div style="background:#f0fdf4;padding:16px;border-radius:12px;margin-top:20px;">
                <p style="color:#166534;font-weight:bold;margin:0;">🚀 Prêt pour la production</p>
            </div>
        </div>
    `);
};

/**
 * Send email verification link to a user
 * Generates a short-lived token, stores it in the DB via Better Auth verificationToken table,
 * and dispatches a premium HTML email.
 */
export const sendEmailVerification = async (profile) => {
    if (!profile?.email) return;

    // Build verification URL using Better Auth's built-in endpoint
    const baseUrl = process.env.BETTER_AUTH_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Generate a simple random token (32 hex chars)
    const token = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Store token in verification table
    try {
        const { default: sequelizeInst } = await import('../config/database.js');
        await sequelizeInst.query(
            `INSERT INTO verification (id, identifier, value, expiresAt, createdAt, updatedAt)
             VALUES (UUID(), :email, :token, :expiresAt, NOW(), NOW())
             ON DUPLICATE KEY UPDATE value = :token, expiresAt = :expiresAt, updatedAt = NOW()`,
            {
                replacements: { email: profile.email, token, expiresAt },
                type: sequelizeInst.QueryTypes.INSERT
            }
        );
    } catch (err) {
        console.warn('[sendEmailVerification] Token storage failed (table may not exist):', err.message);
        // Non-blocking — continue to send email anyway with a link to the page
    }

    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(profile.email)}`;
    const firstName = (profile.fullname || profile.email).split(' ')[0];

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:0;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:40px 40px 30px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.1);border-radius:16px;padding:12px 20px;margin-bottom:20px;">
                <span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Vtout Platform</span>
            </div>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">Vérifiez votre email</h1>
            <p style="color:#94a3b8;font-size:14px;margin:12px 0 0;">Un clic suffit pour sécuriser votre compte.</p>
        </div>

        <!-- Body -->
        <div style="padding:40px;">
            <p style="color:#475569;font-size:16px;margin:0 0 20px;">Bonjour <strong style="color:#0f172a;">${firstName}</strong>,</p>
            <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 30px;">
                Pour finaliser la sécurisation de votre compte Vtout, nous avons besoin de confirmer que cette adresse email vous appartient.
                Cliquez sur le bouton ci-dessous dans les prochaines <strong>24 heures</strong>.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:30px 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;padding:16px 40px;border-radius:14px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.02em;box-shadow:0 8px 20px rgba(99,102,241,0.35);">
                    ✉️ Vérifier mon adresse email
                </a>
            </div>

            <!-- Security note -->
            <div style="background:#f1f5f9;border-radius:14px;padding:20px;margin-top:30px;border:1px solid #e2e8f0;">
                <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
                    🔒 <strong>Lien sécurisé</strong> · Ce lien expire dans 24h. Si vous n'avez pas créé de compte Vtout,
                    vous pouvez ignorer cet email en toute sécurité.
                </p>
            </div>

            <!-- Fallback URL -->
            <p style="color:#94a3b8;font-size:11px;margin-top:24px;word-break:break-all;line-height:1.5;">
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
                <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Vtout · Plateforme e-commerce</p>
        </div>
    </div>`;

    return sendMail(profile.email, '✉️ Confirmez votre adresse email Vtout', html);
};

