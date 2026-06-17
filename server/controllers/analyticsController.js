import { sendMetaCapiEvent } from '../services/metaCapiService.js';

const ALLOWED_EVENTS = new Set([
    'CompleteRegistration', 'SellerRegistration', 'DriverRegistration',
    'Search', 'ViewContent', 'Lead', 'ListingCreated',
    'ContactSeller', 'AddToFavorites', 'InitiateCheckout', 'Purchase'
]);

export const proxyMetaCapiEvent = async (req, res) => {
    try {
        const { event_name, custom_data, event_source_url, fbc, fbp, user_email, user_phone, event_id } = req.body;

        if (!event_name || !ALLOWED_EVENTS.has(event_name)) {
            return res.status(400).json({ error: 'event_name invalide ou non autorisé' });
        }

        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;
        const userAgent = req.headers['user-agent'];

        // Fire-and-forget — don't block the response
        sendMetaCapiEvent({
            eventName: event_name,
            eventSourceUrl: event_source_url || 'https://vtout.com',
            userData: { email: user_email, phone: user_phone, ip, userAgent, fbc, fbp },
            customData: custom_data || {},
            eventId: event_id || null
        }).catch(err => console.error('[Analytics] CAPI error:', err));

        res.json({ success: true });
    } catch (err) {
        console.error('[Analytics] proxyMetaCapiEvent error:', err);
        res.status(500).json({ error: 'Erreur serveur analytics' });
    }
};
