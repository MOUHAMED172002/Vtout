import { Expo } from 'expo-server-sdk';
import Profile from '../models/Profile.js';

const expo = new Expo();

// Envoie une notification push Expo à tous les appareils enregistrés d'un
// utilisateur. Appelé automatiquement par le hook afterCreate du modèle
// Notification (voir models/Notification.js) — aucun appel manuel requis
// dans les controllers existants.
export const sendPushToUser = async (userId, title, body, data = {}) => {
    if (!userId) return;

    try {
        const profile = await Profile.findByPk(userId);
        const tokens = profile?.metadata?.expo_push_tokens;
        if (!Array.isArray(tokens) || tokens.length === 0) return;

        const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
        if (validTokens.length === 0) return;

        const messages = validTokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));

        const chunks = expo.chunkPushNotifications(messages);
        const staleTokens = [];

        for (const chunk of chunks) {
            try {
                const tickets = await expo.sendPushNotificationsAsync(chunk);
                tickets.forEach((ticket, idx) => {
                    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
                        staleTokens.push(chunk[idx].to);
                    }
                });
            } catch (err) {
                console.error('[pushNotificationService] chunk send error:', err.message);
            }
        }

        if (staleTokens.length > 0) {
            const remaining = validTokens.filter((t) => !staleTokens.includes(t));
            profile.metadata = { ...profile.metadata, expo_push_tokens: remaining };
            await profile.save();
        }
    } catch (err) {
        console.error('[pushNotificationService] sendPushToUser error:', err.message);
    }
};
