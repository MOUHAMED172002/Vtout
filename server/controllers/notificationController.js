import { Notification } from '../models/index.js';

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('getMyNotifications error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        await Notification.update({ is_read: true }, { where: { id, user_id: userId } });
        res.json({ success: true });
    } catch (error) {
        console.error('markAsRead error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
        res.json({ success: true });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Non authentifié' });

        await Notification.destroy({ where: { id, user_id: userId } });
        res.json({ success: true });
    } catch (error) {
        console.error('deleteNotification error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
