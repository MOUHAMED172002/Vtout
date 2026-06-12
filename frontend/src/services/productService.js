import api from './api';

export const searchProducts = async (query) => {
    const { data } = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return data;
};

export const getProducts = async (filters = {}) => {
    const { data } = await api.get('/products', { params: filters });
    // Backward compatibility: if data is a paginated object, return it as is.
    // If it's an array, return it. Call sites will handle either.
    return data;
};

export const getProductById = async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
};

export const getRelatedProducts = async (id) => {
    const { data } = await api.get(`/products/${id}/related`);
    return data;
};

export const getFrequentlyBoughtTogether = async (id) => {
    const { data } = await api.get(`/products/${id}/bought-together`);
    return data;
};

export const createProduct = async (productData, token) => {
    const { data } = await api.post('/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateProduct = async (id, productData, token) => {
    const { data } = await api.put(`/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteProduct = async (id, token) => {
    const { data } = await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const mergeProducts = async (pendingProductId, realProductId, token) => {
    const { data } = await api.post('/products/merge', {
        pendingProductId,
        realProductId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getCategories = async () => {
    const { data } = await api.get('/categories');
    return data;
};

export const createCategory = async (categoryData, token) => {
    const { data } = await api.post('/categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteCategory = async (id, token) => {
    const { data } = await api.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateCategory = async (id, categoryData, token) => {
    const { data } = await api.put(`/categories/${id}`, categoryData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const reorderSubcategories = async (orderedIds, token) => {
    const { data } = await api.post('/categories/reorder', { orderedIds }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAttributes = async () => {
    const { data } = await api.get('/attributes');
    return data;
};

export const getAttributesByCategory = async (categoryId) => {
    const { data } = await api.get(`/attributes/category/${categoryId}`);
    return data;
};

export const createAttribute = async (attrData, token) => {
    const { data } = await api.post('/attributes', attrData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateAttribute = async (id, attrData, token) => {
    const { data } = await api.patch(`/attributes/${id}`, attrData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteAttribute = async (id, token) => {
    const { data } = await api.delete(`/attributes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getAttributeValues = async (attributeId) => {
    const { data } = await api.get(`/attributes/${attributeId}/values`);
    return data;
};

export const addAttributeValue = async (attributeId, value, token, categoryId) => {
    const { data } = await api.post('/attributes/values', {
        attribute_id: attributeId,
        value,
        category_id: categoryId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateAttributeValue = async (id, value, token) => {
    const { data } = await api.patch(`/attributes/values/${id}`, { value }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteAttributeValue = async (id, token) => {
    const { data } = await api.delete(`/attributes/values/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getSuppliers = async () => {
    const { data } = await api.get('/suppliers');
    return data;
};
