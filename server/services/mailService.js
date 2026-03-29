const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
let resend;

if (apiKey) {
    resend = new Resend(apiKey);
} else {
    console.warn('WARNING: RESEND_API_KEY is not defined in .env. Emails will not be sent.');
}

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
                <p style="margin: 0;"><strong>Paiement:</strong> ${order.payment_method === 'delivery' ? 'À la livraison' : 'En ligne'}</p>
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
    `
};

/**
 * Envoi mail général
 */
const sendMail = async (to, subject, html) => {
    if (!resend) return { success: false, error: 'Resend not configured' };
    try {
        const { data, error } = await resend.emails.send({
            from: 'Shop <onboarding@resend.dev>', // Modifiez par votre domaine en prod
            to,
            subject,
            html,
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Mail Error:', error);
        return { success: false, error };
    }
};

exports.sendOrderNotificationToAdmin = async (order) => {
    const adminEmail = process.env.ADMIN_NOTIF_EMAIL || process.env.ADMIN_EMAILS.split(',')[0];
    return sendMail(adminEmail, `🚀 Nouvelle Commande #${order.id.slice(0, 8)}`, templates.orderAdmin(order));
};

exports.sendOrderUpdateToCustomer = async (order, statusLabel) => {
    const email = order.guest_email || order.user_email;
    if (!email) return;
    return sendMail(email, `📦 Commande #${order.id.slice(0, 8)} : ${statusLabel}`, templates.statusUpdate(order, statusLabel));
};

exports.sendProductApprovalNotification = async (supplierEmail, product, status, feedback) => {
    if (!supplierEmail) return;
    const subject = status === 'approved' ? '✅ Produit Approuvé' : '❌ Produit Refusé';
    return sendMail(supplierEmail, subject, templates.productApproval(product, status, feedback));
};

exports.sendInvoiceEmail = async (order, items) => {
    const email = order.guest_email || order.user_email;
    if (!email) return;
    return sendMail(email, `🧾 Votre Reçus - Commande #${order.id.slice(0, 8)}`, generateInvoiceTemplate(order, items));
};
