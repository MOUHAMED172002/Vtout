import express from 'express';
import { Department, Commune, Arrondissement, Quartier, sequelize } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Emergency trigger to import geographic data
router.get('/seed-data', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Try multiple paths to be safe on production
        const paths = [
            path.join(__dirname, '../data/decoupage-territorial-benin.json'),
            path.join(process.cwd(), 'data/decoupage-territorial-benin.json'),
            path.join(process.cwd(), 'server/data/decoupage-territorial-benin.json')
        ];
        
        let jsonPath = null;
        for (const p of paths) {
            if (fs.existsSync(p)) {
                jsonPath = p;
                break;
            }
        }

        if (!jsonPath) {
            return res.status(404).json({ 
                error: "Fichier JSON introuvable", 
                tried_paths: paths 
            });
        }
        
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        await sequelize.transaction(async (t) => {
            for (const dep of data) {
                await Department.upsert({ id: dep.id_dep, name: dep.lib_dep }, { transaction: t });
                for (const com of dep.communes) {
                    await Commune.upsert({ id: com.id_com, department_id: dep.id_dep, name: com.lib_com }, { transaction: t });
                    for (const arr of com.arrondissements) {
                        await Arrondissement.upsert({ id: arr.id_arrond, commune_id: com.id_com, name: arr.lib_arrond }, { transaction: t });
                        for (const quart of arr.quartiers) {
                            await Quartier.upsert({ id: quart.id_quart, arrondissement_id: arr.id_arrond, name: quart.lib_quart }, { transaction: t });
                        }
                    }
                }
            }
        });
        
        res.json({ success: true, message: "Données géographiques importées avec succès." });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add or update location
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
    const { type, parentId, name, id } = req.body;
    try {
        let result;
        const data = { name };
        if (id) data.id = id;

        let model;
        switch (type) {
            case 'department':
                model = Department;
                break;
            case 'commune':
                model = Commune;
                data.department_id = parentId;
                break;
            case 'arrondissement':
                model = Arrondissement;
                data.commune_id = parentId;
                break;
            case 'quartier':
                model = Quartier;
                data.arrondissement_id = parentId;
                break;
            default:
                return res.status(400).json({ message: 'Invalid level type' });
        }

        if (id) {
            result = await model.upsert(data);
        } else {
            result = await model.create(data);
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
