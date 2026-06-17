import api from "./api";

export const registerLivreur = async (token, data) => {
    try {
        const res = await api.post("/delivery/register", data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (err) {
        if (err.response && err.response.data) {
            console.error("SERVER ERROR DETAIL:", err.response.data);
            throw new Error(JSON.stringify(err.response.data));
        }
        throw err;
    }
};

export const getAvailableOrders = async (token) => {
    const res = await api.get("/delivery/available", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getMyDeliveries = async (token) => {
    const res = await api.get("/delivery/my-deliveries", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getDeliveryProfile = async (token) => {
    const res = await api.get("/delivery/me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const assignOrder = async (token, orderId) => {
    const res = await api.post("/delivery/assign", { orderId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const releaseOrder = async (token, orderId) => {
    const res = await api.post("/delivery/release", { orderId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateDeliveryStatus = async (token, orderId, status, delivery_code = null, proof_url = null) => {
    const res = await api.post("/delivery/status", { orderId, status, delivery_code, proof_url }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const toggleDeliveryStatus = async (token, status) => {
    const res = await api.post("/delivery/toggle-status", { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateServiceZones = async (token, zones) => {
    const res = await api.post("/delivery/update-zones", { zones }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getLivreursList = async (token) => {
    try {
        const res = await api.get("/delivery/admin/list", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error("Error fetching livreurs:", err);
        return [];
    }
};

export const adminAssignOrder = async (token, orderId, deliveryPersonId) => {
    const res = await api.post("/delivery/admin/assign", { orderId, deliveryPersonId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const verifyLivreur = async (token, id, isVerified) => {
    const res = await api.post(`/delivery/admin/verify/${id}`, { is_verified: isVerified }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getDeliveryStatsAdmin = async (token) => {
    const res = await api.get("/delivery/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const confirmCashRemitted = async (token, deliveryPersonId) => {
    const res = await api.post("/delivery/admin/confirm-cash", { deliveryPersonId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getMyKycStatus = async (token) => {
    const res = await api.get("/delivery/my-kyc", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const reviewKyc = async (token, id, action, rejectionReason = '') => {
    const res = await api.post(`/delivery/admin/kyc-review/${id}`, { action, rejection_reason: rejectionReason }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteLivreur = async (token, id) => {
    const res = await api.delete(`/delivery/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};


export const getCashHistory = async (token) => {
    const res = await api.get("/delivery/admin/cash-history", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const generateCashPaymentLink = async (orderId, token) => {
    const res = await api.post("/delivery/generate-cash-link", { orderId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
