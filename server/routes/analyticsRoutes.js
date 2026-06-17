import express from 'express';
import { proxyMetaCapiEvent } from '../controllers/analyticsController.js';

const router = express.Router();

// Public endpoint — no auth required (events like sign-up happen before session)
router.post('/meta-capi', proxyMetaCapiEvent);

export default router;
