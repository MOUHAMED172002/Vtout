import axios from 'axios';
import { Config } from '../models/index.js';
import { getTextTemplate, getTextConfig } from './textTemplateService.js';

/**
 * Helper : Formater le numéro au format international attendu par WhatChimp
 * (indicatif pays + chiffres uniquement, sans le +).
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // 1. Enlever tout ce qui n'est pas un chiffre
    let clean = phone.replace(/\D/g, '');

    // 2. Gérer le préfixe 00xxx (ex: 0022997000000 → 22997000000)
    if (clean.startsWith('00')) {
        clean = clean.substring(2);
    }

    // 3. Numéros locaux béninois sans indicatif — deux formats possibles :
    //    - Ancien format à 8 chiffres, conservé pour rétrocompatibilité
    //      (ex: 97000000 → 22997000000)
    //    - Nouveau format à 10 chiffres depuis nov. 2024, commençant par 0
    //      (ex: 0167703242 → 2290167703242). Sans ce cas, un numéro saisi/
    //      stocké sans le "229" partait tel quel vers l'API, qui le
    //      rejetait ("invalid phone number") — notification jamais envoyée.
    if (clean.length === 8) {
        return '229' + clean;
    }
    if (clean.length === 10 && clean.startsWith('0')) {
        return '229' + clean;
    }

    // 4. Tous les autres numéros (9 chiffres et plus, hors cas ci-dessus) sont
    //    déjà en format international ou semi-international — on passe
    //    directement. Exemples corrects : 2290197000000 (nouveau Bénin),
    //    22997000000 (ancien), 22890000000 (Togo), 33600000000 (France), etc.
    return clean;
};

/**
 * Récupérer les configs WhatsApp de la DB
 */
export const getWhatsAppConfigs = async () => {
    try {
        const configs = await Config.findAll({
            where: { group: 'whatsapp' }
        });

        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });

        return {
            // WhatChimp (WhatsApp Cloud API officielle) — remplace Green API.
            // phoneNumberId identifie le numéro WhatsApp connecté côté
            // WhatChimp ; apiToken est la clé de compte WhatChimp (pas un
            // jeton Meta), voir server/services/whatsappService.js sendWhatsAppMessage.
            phoneNumberId: configMap['whatsapp_phone_number_id'] || process.env.WHATCHIMP_PHONE_NUMBER_ID,
            apiToken: configMap['whatsapp_api_token'] || process.env.WHATCHIMP_API_TOKEN,
            adminPhones: configMap['whatsapp_admin_phones'] || process.env.ADMIN_WHATSAPP_PHONE,
            notifCustomer: configMap['notif_whatsapp_customer'] !== 'false', // Default true
            notifSupplier: configMap['notif_whatsapp_supplier'] !== 'false',
            notifDeliverer: configMap['notif_whatsapp_deliverer'] !== 'false'
        };
    } catch (e) {
        return {
            phoneNumberId: process.env.WHATCHIMP_PHONE_NUMBER_ID,
            apiToken: process.env.WHATCHIMP_API_TOKEN,
            adminPhones: process.env.ADMIN_WHATSAPP_PHONE,
            notifCustomer: true,
            notifSupplier: true,
            notifDeliverer: true
        };
    }
};

// Endpoint WhatChimp "Send Text Message" — repose sur l'API Cloud
// officielle WhatsApp de Meta. IMPORTANT (contrairement à Green API,
// non-officielle, qui acceptait n'importe quel texte à tout moment) :
// un message texte libre n'est autorisé que dans les 24h suivant le
// dernier message ENVOYÉ PAR le destinataire (fenêtre de session client).
// En dehors de cette fenêtre, Meta exige un message "template" pré-
// approuvé — cet appel échouera silencieusement (status "0") pour un
// destinataire qui ne nous a jamais écrit en premier, ce qui concerne la
// plupart de nos notifications sortantes (confirmation de commande, OTP…).
// Voir la doc WhatChimp "Send Template Message" si ce cas doit être géré.
const WHATCHIMP_SEND_URL = 'https://app.whatchimp.com/api/v1/whatsapp/send';

/**
 * Envoyer un message WhatsApp via WhatChimp (API Cloud WhatsApp officielle)
 */
export const sendWhatsAppMessage = async (to, body) => {
    const { phoneNumberId, apiToken } = await getWhatsAppConfigs();

    if (!phoneNumberId || !apiToken) {
        console.warn('[WhatChimp] ⚠️  Service non configuré — vérifiez le Phone Number ID et le Token API dans Admin > Paramètres.');
        return { success: false, error: 'Identifiants WhatChimp manquants' };
    }

    if (!to) {
        console.warn('[WhatChimp] ⚠️  Numéro destinataire manquant — le client n\'a peut-être pas de téléphone enregistré.');
        return { success: false, error: 'Numéro destinataire manquant' };
    }

    const cleanTo = formatPhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
        console.warn(`[WhatChimp] ⚠️  Numéro invalide après formatage : "${to}" → "${cleanTo}"`);
        return { success: false, error: 'Numéro invalide' };
    }

    try {
        console.log(`[WhatChimp] Envoi à ${cleanTo}...`);
        const response = await axios.post(WHATCHIMP_SEND_URL, new URLSearchParams({
            apiToken,
            phone_number_id: phoneNumberId,
            message: body,
            phone_number: cleanTo
        }));

        // status est une CHAÎNE ("1"/"0"), pas un booléen — confirmé par la doc WhatChimp.
        if (String(response.data?.status) === '1') {
            console.log(`[WhatChimp] ✅ Succès ! ID: ${response.data.wa_message_id}`);
            return { success: true, sid: response.data.wa_message_id };
        } else {
            console.warn('[WhatChimp] Échec envoi:', response.data?.message || response.data);
            return { success: false, error: response.data?.message || 'Réponse inattendue de l\'API' };
        }
    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('[WhatChimp] ❌ Erreur envoi:', detail);
        return { success: false, error: String(detail?.message || detail) };
    }
};

/**
 * Notifications classiques
 */
export const sendNewOrderWhatsApp = async (to, orderId, amount) => {
    const { notifCustomer } = await getWhatsAppConfigs();
    if (!notifCustomer) return;
    const messageBody = await getTextTemplate(
        'whatsapp_new_order_customer',
        `📦 *Nouvelle commande Vtout !*\nID: #${orderId.slice(0, 8)}\nMontant: ${Number(amount).toLocaleString()} F.\n\nMerci de votre confiance !`,
        { orderId: orderId.slice(0, 8), amount: Number(amount).toLocaleString() }
    );
    return sendWhatsAppMessage(to, messageBody);
};

/**
 * Alerter le fournisseur d'une nouvelle commande
 */
export const notifySupplierOfNewOrder = async (supplierPhone, orderId, amount, isReminder = false) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;
    
    let message = await getTextTemplate(
        'whatsapp_new_order_supplier',
        `🔔 *VTOUT : Nouvelle commande !*\nVous avez une nouvelle commande à préparer.\nID: #${orderId.slice(0, 8)}\nMontant: ${Number(amount).toLocaleString()} F.\n\nConnectez-vous à votre portail fournisseur pour voir les détails.`,
        { orderId: orderId.slice(0, 8), amount: Number(amount).toLocaleString() }
    );
    
    if (isReminder) {
        message = await getTextTemplate(
            'whatsapp_reminder_order_supplier',
            `⏳ *VTOUT : RAPPEL - Commande en attente !*\nLa commande #${orderId.slice(0, 8)} (${Number(amount).toLocaleString()} F) attend toujours votre préparation.\n\nMerci de la confirmer rapidement pour éviter tout retard de livraison.`,
            { orderId: orderId.slice(0, 8), amount: Number(amount).toLocaleString() }
        );
    }

    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le fournisseur d'un stock bas
 */
export const notifySupplierOfLowStock = async (supplierPhone, productName, remainingStock) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;
    const message = await getTextTemplate(
        'whatsapp_low_stock_supplier',
        `⚠️ *VTOUT : Alerte Stock Bas !*\nLe produit *${productName}* est presque épuisé.\nStock restant : *${remainingStock}* unités.\n\nPensez à vous réapprovisionner rapidement pour éviter une rupture !`,
        { productName, remainingStock }
    );
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le livreur d'un nouvel assignement
 */
export const notifyDelivererOfAssignment = async (delivererPhone, orderId) => {
    const { notifDeliverer } = await getWhatsAppConfigs();
    if (!notifDeliverer || !delivererPhone) return;
    const message = await getTextTemplate(
        'whatsapp_deliverer_assignment',
        `🛵 *VTOUT : Nouvelle course !*\nUne commande vous a été assignée.\nID: #${orderId.slice(0, 8)}\nVeuillez vous rendre chez le fournisseur pour la récupération.`,
        { orderId: orderId.slice(0, 8) }
    );
    return sendWhatsAppMessage(delivererPhone, message);
};

const normalizeStatusKey = (status) => {
    const mapping = {
        'confirmée': 'confirmee',
        'expédiée': 'expediee',
        'livrée': 'livree',
        'annulée': 'annulee',
        'retournée': 'retournee'
    };
    return mapping[status] || String(status).toLowerCase().replace(/[^a-z0-9]+/g, '_');
};

const EMAIL_STATUS_LABELS = {
    'confirmée': 'Confirmée',
    'expédiée': 'Expédiée',
    'livrée': 'Livrée',
    'annulée': 'Annulée',
    'retournée': 'Retournée',
};

/**
 * Alerter le client d'un changement de statut
 *
 * fallbackEmail (optionnel) : si l'envoi WhatsApp échoue (hors fenêtre de
 * session client 24h — voir WHATCHIMP_SEND_URL plus haut —, numéro
 * invalide, service non configuré…), on bascule sur un email pour ne pas
 * laisser le client sans nouvelle — un échec silencieux de WhatChimp
 * équivalait avant à ne prévenir personne.
 */
export const notifyCustomerOfStatusUpdate = async (customerPhone, orderId, status, fallbackEmail = null) => {
    const { notifCustomer } = await getWhatsAppConfigs();
    if (!notifCustomer || !customerPhone) return;
    const statusKey = normalizeStatusKey(status);
    const statusMessages = {
        'confirmée': 'est maintenant *confirmée* et en préparation.',
        'expédiée': 'est maintenant *expédiée* ! Le livreur est en route.',
        'livrée': 'a été *livrée*. Merci d\'avoir choisi Vtout !',
        'annulée': 'a été *annulée*.',
        'retournée': 'a été *retournée*.',
    };
    const defaultStatus = statusMessages[status] || `est maintenant : *${status}*`;
    const defaultBody = `📦 *VTOUT : Mise à jour de commande*\nVotre commande #${orderId.slice(0, 8)} ${defaultStatus}`;
    const message = await getTextTemplate(
        `whatsapp_order_status_customer_${statusKey}`,
        defaultBody,
        { orderId: orderId.slice(0, 8), status }
    );
    const result = await sendWhatsAppMessage(customerPhone, message);
    if (!result?.success && fallbackEmail) {
        try {
            const { sendOrderUpdateToCustomer } = await import('./mailService.js');
            await sendOrderUpdateToCustomer({ id: orderId, guest_email: fallbackEmail }, EMAIL_STATUS_LABELS[status] || status);
        } catch (mailErr) {
            console.error('[Notif Fallback] Email de secours échoué:', mailErr);
        }
    }
    return result;
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
    const statusKey = normalizeStatusKey(status);
    const key = `whatsapp_supplier_status_${statusKey}`;
    const message = await getTextTemplate(
        key,
        messages[status] || `Votre statut fournisseur est maintenant : *${status}*`,
        { status }
    );
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le livreur du statut de sa vérification
 */
export const notifyDelivererStatusUpdate = async (delivererPhone, isVerified) => {
    const { notifDeliverer } = await getWhatsAppConfigs();
    if (!notifDeliverer || !delivererPhone) return;

    const key = isVerified ? 'whatsapp_deliverer_status_verified' : 'whatsapp_deliverer_status_pending';
    const defaultMessage = isVerified
        ? '✅ *Félicitations !* Votre compte livreur Vtout a été vérifié. Vous pouvez maintenant prendre des courses.'
        : '⏳ *VTOUT :* Votre compte livreur est actuellement en attente de vérification.';

    const message = await getTextTemplate(
        key,
        defaultMessage,
        { isVerified }
    );
    return sendWhatsAppMessage(delivererPhone, message);
};

/**
 * Alerter le fournisseur du statut de son produit (Approuvé/Rejeté)
 */
export const notifyProductStatusUpdate = async (supplierPhone, productName, status, feedback) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;

    const key = `whatsapp_product_status_${status}`;
    const defaultMessage = status === 'approved'
        ? `✅ *Produit Approuvé !*\nVotre produit *${productName}* a été validé et est maintenant en ligne.`
        : status === 'rejected'
            ? `❌ *Produit Rejeté :*\nVotre produit *${productName}* n'a pas été validé.\nMotif : ${feedback || 'Non spécifié'}`
            : null;

    if (!defaultMessage) return;
    const message = await getTextTemplate(
        key,
        defaultMessage,
        { productName, feedback }
    );
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le client/vendeur d'une réponse au support
 */
export const notifySupportReply = async (phone, ticketId) => {
    if (!phone) return;
    const message = await getTextTemplate(
        'whatsapp_support_reply',
        `💬 *VTOUT : Nouveau message support*\nNous avons répondu à votre demande (Ticket #${ticketId.slice(0, 8)}).\nConsultez votre tableau de bord pour voir la réponse.`,
        { ticketId: ticketId.slice(0, 8) }
    );
    return sendWhatsAppMessage(phone, message);
};

/**
 * Alerter l'administrateur (plusieurs possibles)
 */
export const notifyAdmin = async (message) => {
    const { adminPhones } = await getWhatsAppConfigs();
    if (!adminPhones) return;
    
    const prefix = await getTextConfig('whatsapp_admin_prefix', '🚩 *VTOUT ADMIN NOTIF*', 'messages');
    const adminMessage = `${prefix}\n${message}`;
    const phones = adminPhones.split(',').map(p => p.trim()).filter(p => p);
    
    for (const phone of phones) {
        await sendWhatsAppMessage(phone, adminMessage);
    }
};

/**
 * Alerter le fournisseur d'un changement de statut de la commande
 */
export const notifySupplierOfOrderStatusUpdate = async (supplierPhone, orderId, status) => {
    const { notifSupplier } = await getWhatsAppConfigs();
    if (!notifSupplier || !supplierPhone) return;
    const statusKey = normalizeStatusKey(status);
    const statusMessages = {
        'confirmée': 'a été *confirmée* par le client et est en préparation.',
        'expédiée': 'a été *expédiée* ! Le livreur l\'a récupérée.',
        'livrée': 'a été livrée au client avec succès. Vos gains ont été crédités sur votre portefeuille !',
        'annulée': 'a été *annulée*.',
        'retournée': 'a été marquée comme *retournée*.'
    };
    const defaultStatus = statusMessages[status] || `est maintenant : *${status}*`;
    const message = await getTextTemplate(
        `whatsapp_supplier_order_status_${statusKey}`,
        `🔔 *VTOUT : Statut de commande modifié*\nLa commande #${orderId.slice(0, 8)} ${defaultStatus}`,
        { orderId: orderId.slice(0, 8), status }
    );
    return sendWhatsAppMessage(supplierPhone, message);
};

/**
 * Alerter le livreur d'un changement de statut de la commande
 */
export const notifyDelivererOfOrderStatusUpdate = async (delivererPhone, orderId, status) => {
    const { notifDeliverer } = await getWhatsAppConfigs();
    if (!notifDeliverer || !delivererPhone) return;
    const statusKey = normalizeStatusKey(status);
    const statusMessages = {
        'annulée': 'a été *annulée*. Veuillez ne pas effectuer la livraison.',
        'retournée': 'a été marquée comme *retournée*.'
    };
    const statusMsg = statusMessages[status];
    if (!statusMsg) return; // Seules les annulations/retours ou autres statuts pertinents
    const message = await getTextTemplate(
        `whatsapp_deliverer_order_status_${statusKey}`,
        `🛵 *VTOUT : Annulation de course*\nLa course #${orderId.slice(0, 8)} ${statusMsg}`,
        { orderId: orderId.slice(0, 8), status }
    );
    return sendWhatsAppMessage(delivererPhone, message);
};
