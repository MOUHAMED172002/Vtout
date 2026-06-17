import api from './api';

const getFbCookies = () => {
    const acc = {};
    document.cookie.split(';').forEach(c => {
        const [k, v] = c.trim().split('=');
        const key = (k || '').trim();
        if (key === '_fbc' || key === '_fbp') acc[key.slice(1)] = v;
    });
    return acc;
};

/**
 * Fire a Meta Pixel event AND send it to the backend CAPI proxy.
 * eventName: standard Meta event name (e.g. 'CompleteRegistration') or
 *            prefixed with 'custom:' for custom events (e.g. 'custom:SellerRegistration').
 */
export const hasConsent = () => localStorage.getItem('cookie-consent') === 'accepted';

export const trackGA4 = (event, params = {}) => {
    if (!hasConsent()) return;
    window.gtag?.('event', event, params);
};

export const trackMeta = (eventName, params = {}, userEmail = null) => {
    if (!hasConsent()) return;

    // 1. Pixel (browser-side)
    if (window.fbq) {
        if (eventName.startsWith('custom:')) {
            window.fbq('trackCustom', eventName.replace('custom:', ''), params);
        } else {
            window.fbq('track', eventName, params);
        }
    }

    // 2. CAPI (server-side via proxy) — fire-and-forget
    const { fbc, fbp } = getFbCookies();
    api.post('/analytics/meta-capi', {
        event_name: eventName.replace('custom:', ''),
        custom_data: params,
        event_source_url: window.location.href,
        fbc,
        fbp,
        user_email: userEmail || null
    }).catch(() => {});
};
