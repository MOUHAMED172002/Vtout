import api from './api';

export const getFaqs = async () => {
    const { data } = await api.get('/content/faqs');
    return data;
};

export const createFaq = async (faqData, token) => {
    const { data } = await api.post('/content/faqs', faqData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updateFaq = async (id, faqData, token) => {
    const { data } = await api.put(`/content/faqs/${id}`, faqData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deleteFaq = async (id, token) => {
    const { data } = await api.delete(`/content/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const getPolicies = async () => {
    const { data } = await api.get('/content/policies');
    return data;
};

export const createPolicy = async (policyData, token) => {
    const { data } = await api.post('/content/policies', policyData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const updatePolicy = async (id, policyData, token) => {
    const { data } = await api.put(`/content/policies/${id}`, policyData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const deletePolicy = async (id, token) => {
    const { data } = await api.delete(`/content/policies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};
