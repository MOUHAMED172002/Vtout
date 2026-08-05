import api from './api';

export const registerSupplier = async (supplierData, token) => {
    const { data } = await api.post('/suppliers/register', supplierData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMySupplierProfile = async (token) => {
    const { data } = await api.get('/suppliers/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMySupplierProducts = async (token) => {
    const { data } = await api.get('/suppliers/me/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

// Alias for compatibility
export const getSupplierProducts = getMySupplierProducts;

// Un seul produit du vendeur connecté — contrairement à l'endpoint public,
// inclut cost_price (mémo privé du prix d'achat), pour préremplir le formulaire d'édition.
export const getMySupplierProductById = async (id, token) => {
    const { data } = await api.get(`/suppliers/me/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getMyBoutiques = async (token) => {
    const { data } = await api.get('/suppliers/me/boutiques', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const createBoutique = async (boutiqueData, token) => {
    const { data } = await api.post('/suppliers/me/boutiques', boutiqueData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const getSuppliers = async () => {
    const { data } = await api.get('/suppliers');
    return data;
};


export const updateSupplierStatus = async (id, statusData, token) => {
    const { data } = await api.put(`/suppliers/${id}`, statusData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateSupplierProductStatus = async (productId, statusData, token) => {
    const { data } = await api.put(`/products/${productId}`, statusData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
export const updateProductStock = async (productId, stock, token) => {
    const { data } = await api.put(`/products/${productId}`, { stock, preserve_approval: true }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};

export const updateVariantStocks = async (productId, variantStocks, token) => {
    const { data } = await api.put(`/products/${productId}`, { variantStocks, preserve_approval: true }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data;
};
