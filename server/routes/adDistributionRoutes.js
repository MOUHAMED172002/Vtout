import express from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import * as distributorController from '../controllers/adDistributorController.js';
import * as adminController from '../controllers/adAdminController.js';

const router = express.Router();

// Les captures de statut doivent rester en mémoire (buffer) le temps d'être
// hashées pour la détection de doublons — voir services/adFraudService.js —
// avant d'être envoyées à Cloudinary. D'où une instance multer dédiée,
// distincte de config/cloudinary.js (upload direct en streaming, sans buffer).
const screenshotUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── Distributeur (compte connecté quelconque) ───────────────────────────
router.post('/me/request-otp', requireAuth, distributorController.requestPhoneOtp);
router.post('/me/verify-otp', requireAuth, distributorController.verifyPhoneOtp);
router.get('/me', requireAuth, distributorController.getMyDistributorProfile);
router.patch('/me/momo', requireAuth, distributorController.updateMomoNumber);

router.get('/campaigns', requireAuth, distributorController.getAvailableCampaigns);
router.post('/campaigns/:id/claim', requireAuth, distributorController.claimCampaign);

router.get('/submissions', requireAuth, distributorController.getMySubmissions);
router.post('/submissions/:id/screenshot-early', requireAuth, screenshotUpload.single('screenshot'), distributorController.submitEarlyScreenshot);
router.post('/submissions/:id/screenshot-late', requireAuth, screenshotUpload.single('screenshot'), distributorController.submitLateScreenshot);
router.post('/submissions/:id/live-check', requireAuth, screenshotUpload.single('screenshot'), distributorController.submitLiveCheckScreenshot);

// ── Admin ────────────────────────────────────────────────────────────────
router.get('/admin/campaigns', requireAuth, requireAdmin, adminController.getAllCampaigns);
router.post('/admin/campaigns', requireAuth, requireAdmin, adminController.createCampaign);
router.patch('/admin/campaigns/:id', requireAuth, requireAdmin, adminController.updateCampaign);
router.delete('/admin/campaigns/:id', requireAuth, requireAdmin, adminController.deleteCampaign);

router.get('/admin/queue', requireAuth, requireAdmin, adminController.getModerationQueue);
router.get('/admin/payouts', requireAuth, requireAdmin, adminController.getPayoutQueue);
router.get('/admin/submissions/:id', requireAuth, requireAdmin, adminController.getSubmissionDetail);
router.patch('/admin/submissions/:id/approve', requireAuth, requireAdmin, adminController.approveSubmission);
router.patch('/admin/submissions/:id/reject', requireAuth, requireAdmin, adminController.rejectSubmission);
router.patch('/admin/submissions/:id/live-check', requireAuth, requireAdmin, adminController.requestLiveCheck);
router.patch('/admin/submissions/:id/mark-paid', requireAuth, requireAdmin, adminController.markPaid);

router.get('/admin/distributors', requireAuth, requireAdmin, adminController.getAllDistributors);
router.patch('/admin/distributors/:id/ban', requireAuth, requireAdmin, adminController.banDistributor);
router.patch('/admin/distributors/:id/unban', requireAuth, requireAdmin, adminController.unbanDistributor);

export default router;
