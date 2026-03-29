import api from "./api";

export const registerLivreur = async (token, data) => {
    // Note: token parameter kept for backward compatibility but api handles session via cookie
    const res = await api.post("/delivery/register", data);
    return res.data;
};

export const getAvailableOrders = async (token) => {
    const res = await api.get("/delivery/available");
    return res.data;
};

export const getMyDeliveries = async (token) => {
    const res = await api.get("/delivery/my-deliveries");
    return res.data;
};

export const getDeliveryProfile = async (token) => {
    const res = await api.get("/delivery/me");
    return res.data;
};

export const assignOrder = async (token, orderId) => {
    const res = await api.post("/delivery/assign", { orderId });
    return res.data;
};

export const releaseOrder = async (token, orderId) => {
    const res = await api.post("/delivery/release", { orderId });
    return res.data;
};

export const updateDeliveryStatus = async (token, orderId, status) => {
    const res = await api.post("/delivery/status", { orderId, status });
    return res.data;
};

export const toggleDeliveryStatus = async (token, status) => {
    const res = await api.post("/delivery/toggle-status", { status });
    return res.data;
};

export const updateServiceZones = async (token, zones) => {
    const res = await api.post("/delivery/update-zones", { zones });
    return res.data;
};

export const getLivreursList = async (token) => {
    try {
        const res = await api.get("/delivery/admin/list");
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error("Error fetching livreurs:", err);
        return [];
    }
};

export const adminAssignOrder = async (token, orderId, deliveryPersonId) => {
    const res = await api.post("/delivery/admin/assign", { orderId, deliveryPersonId });
    return res.data;
};

export const verifyLivreur = async (token, id, isVerified) => {
    const res = await api.post(`/delivery/admin/verify/${id}`, { is_verified: isVerified });
    return res.data;
};

export const getDeliveryStatsAdmin = async (token) => {
    const res = await api.get("/delivery/admin/stats");
    return res.data;
};

export const confirmCashRemitted = async (token, deliveryPersonId) => {
    const res = await api.post("/delivery/admin/confirm-cash", { deliveryPersonId });
    return res.data;
};
