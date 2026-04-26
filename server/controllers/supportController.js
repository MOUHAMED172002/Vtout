import { SupportMessage, Profile, sequelize } from '../models/index.js';
import { Op } from 'sequelize';


// Send message
export const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, conversation_id, attachment_url } = req.body;
        const sender_id = req.auth.userId;

        const message = await SupportMessage.create({
            sender_id,
            receiver_id,
            content,
            conversation_id: conversation_id || `${sender_id}_admin`,
            attachment_url
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
};

// Get messages
export const getMessages = async (req, res) => {
    try {
        const userId = req.auth.userId;
        console.log(`[SupportController] Fetching messages for user: ${userId}`);
        const { conversation_id } = req.query;

        const where = {
            [Op.or]: [
                { sender_id: userId },
                { receiver_id: userId }
            ]
        };

        // If admin, we can see any conversation
        const userProfile = await Profile.findOne({ where: { id: userId } });
        
        if (userProfile && userProfile.role === 'admin') {
            // Admin can access any message if they provide a conversation_id
            if (conversation_id) {
                delete where[Op.or];
                where.conversation_id = conversation_id;
            }
        } else if (conversation_id) {
            where.conversation_id = conversation_id;
        }

        const messages = await SupportMessage.findAll({
            where,
            include: [{
                model: Profile,
                as: 'sender',
                attributes: ['fullname', 'avatar_url', 'role']
            }],
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur récupération messages' });
    }
};

// Get all conversations (Admin only)
export const getAllConversations = async (req, res) => {
    try {
        // Obtenir la dernière date pour chaque conversation
        const lastMessages = await SupportMessage.findAll({
            attributes: [
                'conversation_id',
                [sequelize.fn('MAX', sequelize.col('created_at')), 'latest']
            ],
            group: ['conversation_id'],
            raw: true
        });

        if (lastMessages.length === 0) return res.json([]);

        // Récupérer les messages complets correspondant à ces dates pour avoir les contenus et profils
        const conversationDetails = await Promise.all(lastMessages.map(async (lm) => {
            return await SupportMessage.findOne({
                where: {
                    conversation_id: lm.conversation_id,
                    created_at: lm.latest
                },
                include: [{
                    model: Profile,
                    as: 'sender',
                    attributes: ['fullname', 'role', 'avatar_url']
                }],
                order: [['id', 'DESC']]
            });
        }));

        res.json(conversationDetails.filter(c => c !== null));
    } catch (error) {
        console.error("[getAllConversations] error:", error);
        res.status(500).json({ error: 'Erreur admin conversations', details: error.message });
    }
};