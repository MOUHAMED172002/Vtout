import crypto from 'crypto';

const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '2483353495522576';
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

const sha256 = (value) => {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
};

/**
 * Send an event to Meta Conversions API.
 * Call fire-and-forget: always .catch(console.error) at call site.
 */
export const sendMetaCapiEvent = async ({
    eventName,
    eventSourceUrl = 'https://vtout.com',
    userData = {},
    customData = {},
    eventId = null
}) => {
    if (!ACCESS_TOKEN) {
        console.warn('[Meta CAPI] FACEBOOK_ACCESS_TOKEN not set — skipping');
        return;
    }

    const userDataPayload = {
        em: sha256(userData.email),
        ph: sha256(userData.phone?.replace?.(/\D/g, '')),
        client_ip_address: userData.ip || undefined,
        client_user_agent: userData.userAgent || undefined,
        fbc: userData.fbc || undefined,
        fbp: userData.fbp || undefined,
    };
    // Strip undefined keys so Meta API doesn't complain
    Object.keys(userDataPayload).forEach(k => {
        if (userDataPayload[k] === undefined) delete userDataPayload[k];
    });

    const event = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: userDataPayload,
    };
    if (Object.keys(customData).length) event.custom_data = customData;
    if (eventId) event.event_id = eventId;

    const body = { data: [event] };

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) {
        console.error('[Meta CAPI] API error:', result);
    }
    return result;
};
