import axios from 'axios';
import { Config } from '../models/index.js';

/**
 * Helper : Formater le numéro pour Green API
 * Green API s'attend au format international (sans le +) suivi de @c.us
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // 1. Enlever tout ce qui n'est pas un chiffre
    let clean = phone.replace(/\D/g, '');
    
    // 2. Gérer le cas où l'utilisateur commence par 00 (ex: 00229...)
    if (phone.startsWith('00')) {
        clean = clean.substring(2);
    }

    // 3. Cas spécifiques au Bénin (S'il n'y a pas d'indicateur détecté au début)
    // On considère que si le numéro fait 8 ou 10 chiffres et ne commence pas par un indicateur connu, c'est du local Bénin
    
    // Si c'est un numéro local Bénin à 10 chiffres commençant par 01 (nouveau format)
    if (clean.length === 10 && clean.startsWith('01')) {
        return '229' + clean.substring(2);
    }
    
    // Si c'est un numéro local Bénin à 8 chiffres (ancien format)
    if (clean.length === 8) {
        return '229' + clean;
    }

    // Cas spécifique : certains saisissent 229 + 01 + numéro (12 chiffres)
    if (clean.startsWith('22901') && clean.length === 12) {
        return '229' + clean.substring(5);
    }

    // 4. Si le numéro est déjà au format international (plus de 10 chiffres)
    // On le laisse tel quel (Green API s'occupera du reste)
    // Exemple: 228... (Togo), 225... (CI), 33... (France)
    if (clean.length >= 11) {
        return clean;
    }
    
    // Par défaut, si on ne sait pas, on renvoie le nettoyé
    return clean;
};

/**
 * Récupérer les configs WhatsApp de la DB
 */
const getWhatsAppConfigs = async () => {
    try {
        const configs = await Config.findAll({
            where: { group: 'whatsapp' }
        });
        
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });

        return {
            idInstance: configMap['whatsapp_instance_id'] || process.env.GREEN_API_ID_INSTANCE,
            apiToken: configMap['whatsapp_api_token'] || process.env.GREEN_API_TOKEN_INSTANCE,
            adminPhones: configMap['whatsapp_admin_phones'] || process.env.ADMIN_WHATSAPP_PHONE,
            notifCustomer: configMap['notif_whatsapp_customer'] !== 'false', // Default true
            notifSupplier: configMap['notif_whatsapp_supplier'] !== 'false',
            notifDeliverer: configMap['notif_whatsapp_deliverer'] !== 'false'
        };
    } catch (e) {
        return {
            idInstance: process.env.GREEN_API_ID_INSTANCE,
            apiToken: process.env.GREEN_API_TOKEN_INSTANCE,
            adminPhones: process.env.ADMIN_WHATSAPP_PHONE,
            notifCustomer: true,
            notifSupplier: true,
            notifDeliverer: true
        };
    }
};

/**
 * Envoyer un message WhatsApp via Green API (Non-Officiel, simple)
 */
export const sendWhatsAppMessage = async (to, body) => {
    const { idInstance, apiToken } = await getWhatsAppConfigs();

    if (!idInstance || !apiToken || idInstance.includes('XXXX')) {
        console.warn('[Green API] Service non configuré. Veuillez vérifier les paramètres Admin.');
        return { success: false, error: 'Identifiants Green API manquants' };
    }

    const cleanTo = formatPhoneNumber(to);
    const chatId = `${cleanTo}@c.us`;

    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`;

    try {
        console.log(`[Green API] Envoi à ${chatId}...`);
        const response = await axios.post(url, {
            chatId: chatId,
            message: body
        });
        
        if (response.data && response.data.idMessage) {
            console.log(`[Green API] Succès ! ID: ${response.data.idMessage}`);
            return { success: true, sid: response.data.idMessage };
        } else {
            return { success: false, error: 'Réponse inattendue de l\'API' };
        }
    } catch (error) {
        console.error('[Green API] Erreur:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Notifications classiques
 */
export const sendNewOrderWhatsApp = async (to, orderId, amount) => {
    const { notifCustomer } = await getWhatsAppConfigs();
    if (!notifCustomer) return;
    const messageBody = `📦 *Nouvelle commande Vtout !*\nID: #${orderId.slice(0, 8)}\nMontant: ${Number(amount).toLocaleString()} F.\n\nMerci de votre confiance !`;
    return sendWhatsAppMessage(to, messageBody);
};

/**
 * Alerter le fournisseur d'une nouvelle commande
 */
export const notifySupplierOfNewOrder = async (supplierPhone, orderId, amount) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;
    const message = `🔔 *VTOUT : Nouvelle commande !*\nVous avez une nouvelle commande à préparer.\nID: #${orderId.slice(0, 8)}\nMontant: ${Number(amount).toLocaleString()} F.\n\nConnectez-vous à votre portail fournisseur pour voir les détails.`;
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le fournisseur d'un stock bas
 */
export const notifySupplierOfLowStock = async (supplierPhone, productName, remainingStock) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;
    const message = `⚠️ *VTOUT : Alerte Stock Bas !*\nLe produit *${productName}* est presque épuisé.\nStock restant : *${remainingStock}* unités.\n\nPensez à vous réapprovisionner rapidement pour éviter une rupture !`;
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le livreur d'un nouvel assignement
 */
export const notifyDelivererOfAssignment = async (delivererPhone, orderId) => {
    const { notifDeliverer } = await getWhatsAppConfigs();
    if (!notifDeliverer || !delivererPhone) return;
    const message = `🛵 *VTOUT : Nouvelle course !*\nUne commande vous a été assignée.\nID: #${orderId.slice(0, 8)}\nVeuillez vous rendre chez le fournisseur pour la récupération.`;
    return sendWhatsAppMessage(delivererPhone, message);
};

/**
 * Alerter le client d'un changement de statut
 */
export const notifyCustomerOfStatusUpdate = async (customerPhone, orderId, status) => {
    const { notifCustomer } = await getWhatsAppConfigs();
    if (!notifCustomer || !customerPhone) return;
    const statusMessages = {
        'confirmée': 'est maintenant *confirmée* et en préparation.',
        'expédiée': 'est maintenant *expédiée* ! Le livreur est en route.',
        'livrée': 'a été *livrée*. Merci d\'avoir choisi Vtout !',
        'annulée': 'a été *annulée*.',
    };
    const statusMsg = statusMessages[status] || `est maintenant : *${status}*`;
    const message = `📦 *VTOUT : Mise à jour de commande*\nVotre commande #${orderId.slice(0, 8)} ${statusMsg}`;
    return sendWhatsAppMessage(customerPhone, message);
};

/**
 * Alerter le fournisseur du statut de son compte/boutique
 */
export const notifySupplierStatusUpdate = async (supplierPhone, status) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;

    const messages = {
        'active': '🎉 *Félicitations !* Votre compte fournisseur Vtout a été approuvé. Vous pouvez maintenant commencer à vendre.',
        'suspendu': '⚠️ *Alerte :* Votre compte fournisseur Vtout a été temporairement suspendu. Veuillez contacter l\'administration.',
        'rejeté': '❌ *Désolé :* Votre demande d\'inscription comme fournisseur Vtout a été rejetée.',
    };
    const message = messages[status] || `Votre statut fournisseur est maintenant : *${status}*`;
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le livreur du statut de sa vérification
 */
export const notifyDelivererStatusUpdate = async (delivererPhone, isVerified) => {
    const { notifDeliverer } = await getWhatsAppConfigs();
    if (!notifDeliverer || !delivererPhone) return;

    const message = isVerified 
        ? '✅ *Félicitations !* Votre compte livreur Vtout a été vérifié. Vous pouvez maintenant prendre des courses.' 
        : '⏳ *Vtout :* Votre compte livreur est actuellement en attente de vérification.';
    return sendWhatsAppMessage(delivererPhone, message);
};

/**
 * Alerter le fournisseur du statut de son produit (Approuvé/Rejeté)
 */
export const notifyProductStatusUpdate = async (supplierPhone, productName, status, feedback) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;

    const messages = {
        'approved': `✅ *Produit Approuvé !*\nVotre produit *${productName}* a été validé et est maintenant en ligne.`,
        'rejected': `❌ *Produit Rejeté :*\nVotre produit *${productName}* n'a pas été validé.\nMotif : ${feedback || 'Non spécifié'}`
    };
    const message = messages[status];
    if (!message) return;

    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le client/vendeur d'une réponse au support
 */
export const notifySupportReply = async (phone, ticketId) => {
    if (!phone) return;
    const message = `💬 *VTOUT : Nouveau message support*\nNous avons répondu à votre demande (Ticket #${ticketId.slice(0, 8)}).\nConsultez votre tableau de bord pour voir la réponse.`;
    return sendWhatsAppMessage(phone, message);
};

/**
 * Alerter l'administrateur (plusieurs possibles)
 */
export const notifyAdmin = async (message) => {
    const { adminPhones } = await getWhatsAppConfigs();
    if (!adminPhones) return;
    
    const adminMessage = `🚩 *VTOUT ADMIN NOTIF*\n${message}`;
    const phones = adminPhones.split(',').map(p => p.trim()).filter(p => p);
    
    for (const phone of phones) {
        await sendWhatsAppMessage(phone, adminMessage);
    }
};
