import api from './api';

export const getMyOrders = async (token) => {
    const { data } = await api.get('/orders/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getMySupplierOrders = async (token) => {
    const { data } = await api.get('/orders/me/supplier', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAllOrders = async (token) => {
    const { data } = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getOrderById = async (id, token) => {
    const { data } = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const createOrder = async (orderData, token = null) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await api.post('/orders', orderData, { headers });
        return data;
    } catch (error) {
        console.error("Server responded with 500:", JSON.stringify(error.response?.data));
        throw error;
    }
};

export const updateOrderStatus = async (orderId, statusData, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put(`/orders/${orderId}/status`, statusData, { headers });
    return data;
};

export const cancelOrder = async (orderId, token) => {
    const { data } = await api.put(`/orders/${orderId}/status`, { status: 'annulee' }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

// Régénère un lien/token de paiement FedaPay pour une commande — ou un
// PendingCheckout — dont le paiement en ligne a échoué. Pas d'auth requise
// (guests inclus), voir retryOrderPayment côté backend.
export const retryOrderPayment = async (orderId, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(`/orders/${orderId}/retry-payment`, {}, { headers });
    return data;
};

// Confirmation explicite depuis le widget FedaPay embarqué (onComplete) —
// la commande n'existe pas encore côté serveur tant que ce n'est pas
// confirmé (voir orderController.js materializePendingCheckout). Pas d'auth
// requise, re-vérifié serveur-à-serveur dans le contrôleur.
export const confirmPendingPayment = async (pendingCheckoutId, transactionId) => {
    const { data } = await api.post(`/orders/pending-checkout/${pendingCheckoutId}/confirm`, {
        transaction_id: transactionId
    });
    return data;
};

// Infos publiques minimales d'un PendingCheckout (montant, statut) — pour la
// page de reprise de paiement atteinte via le lien envoyé dans la relance
// WhatsApp/email (voir orderExpiryService.js remindPendingCheckouts).
export const getPendingCheckout = async (pendingCheckoutId) => {
    const { data } = await api.get(`/orders/pending-checkout/${pendingCheckoutId}`);
    return data;
};

export const getSuggestedSuppliers = async (id, token) => {
    const { data } = await api.get(`/orders/${id}/suggested-suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const assignSupplier = async (id, supplierId, token) => {
    const { data } = await api.put(`/orders/${id}/assign-supplier`, { supplier_id: supplierId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
