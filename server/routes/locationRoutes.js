import express from 'express';
import { Department, Commune, Arrondissement, Quartier } from '../models/index.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all geography hierarchy
router.get('/hierarchy', async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [{
                model: Commune,
                as: 'communes',
                include: [{
                    model: Arrondissement,
                    as: 'arrondissements',
                    include: [{
                        model: Quartier,
                        as: 'quartiers'
                    }]
                }]
            }]
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Add or update location
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
    const { type, parentId, name, id } = req.body;
    try {
        let result;
        switch (type) {
            case 'department':
                result = await Department.upsert({ id, name });
                break;
            case 'commune':
                result = await Commune.upsert({ id, department_id: parentId, name });
                break;
            case 'arrondissement':
                result = await Arrondissement.upsert({ id, commune_id: parentId, name });
                break;
            case 'quartier':
                result = await Quartier.upsert({ id, arrondissement_id: parentId, name });
                break;
            default:
                return res.status(400).json({ message: 'Invalid level type' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete location
router.delete('/:type/:id', authMiddleware, requireAdmin, async (req, res) => {
    const { type, id } = req.params;
    try {
        let model;
        switch (type) {
            case 'department': model = Department; break;
            case 'commune': model = Commune; break;
            case 'arrondissement': model = Arrondissement; break;
            case 'quartier': model = Quartier; break;
            default: return res.status(400).json({ message: 'Invalid level type' });
        }
        await model.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
