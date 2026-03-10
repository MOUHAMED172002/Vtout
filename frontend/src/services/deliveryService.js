const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const registerLivreur = async (token, data) => {
    const res = await fetch(`${API_URL}/delivery/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register");
    }
    return res.json();
};

export const getAvailableOrders = async (token) => {
    const res = await fetch(`${API_URL}/delivery/available`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch available orders");
    }
    return res.json();
};

export const getMyDeliveries = async (token) => {
    const res = await fetch(`${API_URL}/delivery/my-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch my deliveries");
    }
    return res.json();
};

export const getDeliveryProfile = async (token) => {
    const res = await fetch(`${API_URL}/delivery/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch profile");
    }
    return res.json();
};

export const assignOrder = async (token, orderId) => {
    const res = await fetch(`${API_URL}/delivery/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to assign order");
    }
    return res.json();
};

export const releaseOrder = async (token, orderId) => {
    const res = await fetch(`${API_URL}/delivery/release`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to release order");
    }
    return res.json();
};

export const updateDeliveryStatus = async (token, orderId, status) => {
    const res = await fetch(`${API_URL}/delivery/status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
    }
    return res.json();
};

export const toggleDeliveryStatus = async (token, status) => {
    const res = await fetch(`${API_URL}/delivery/toggle-status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });
    return res.json();
};

export const updateServiceZones = async (token, zones) => {
    const res = await fetch(`${API_URL}/delivery/update-zones`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zones }),
    });
    return res.json();
};

export const getLivreursList = async (token) => {
    const res = await fetch(`${API_URL}/delivery/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const adminAssignOrder = async (token, orderId, deliveryPersonId) => {
    const res = await fetch(`${API_URL}/delivery/admin/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, deliveryPersonId }),
    });
    return res.json();
};

export const verifyLivreur = async (token, id, isVerified) => {
    const res = await fetch(`${API_URL}/delivery/admin/verify/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_verified: isVerified }),
    });
    return res.json();
};

export const getDeliveryStatsAdmin = async (token) => {
    const res = await fetch(`${API_URL}/delivery/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch delivery stats");
    return res.json();
};

export const confirmCashRemitted = async (token, deliveryPersonId) => {
    const res = await fetch(`${API_URL}/delivery/admin/confirm-cash`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryPersonId }),
    });
    return res.json();
};
