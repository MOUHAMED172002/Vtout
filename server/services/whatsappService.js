import axios from 'axios';

/**
 * Helper : Formater le numéro pour Green API
 * Green API s'attend au format international (sans le +) suivi de @c.us
 */
const formatPhoneNumber = (phone) => {
    let clean = phone.replace(/\D/g, '');
    
    // Si c'est un numéro local Bénin à 8 ou 10 chiffres, on ajoute 229
    if ((clean.length === 8 || clean.length === 10) && !clean.startsWith('229')) {
        clean = `229${clean}`;
    }
    
    return clean;
};

/**
 * Envoyer un message WhatsApp via Green API (Non-Officiel, simple)
 */
export const sendWhatsAppMessage = async (to, body) => {
    const idInstance = process.env.GREEN_API_ID_INSTANCE;
    const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;

    if (!idInstance || !apiTokenInstance || idInstance.includes('XXXX')) {
        console.warn('[Green API] Service non configuré. Veuillez vérifier votre .env');
        return { success: false, error: 'Identifiants Green API manquants' };
    }

    const cleanTo = formatPhoneNumber(to);
    const chatId = `${cleanTo}@c.us`;

    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

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
    const messageBody = `📦 Nouvelle commande Vtout ! ID: #${orderId.slice(0, 8)}. Montant: ${Number(amount).toLocaleString()} F.`;
    return sendWhatsAppMessage(to, messageBody);
};
