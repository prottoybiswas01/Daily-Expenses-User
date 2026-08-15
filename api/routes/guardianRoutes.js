const express = require('express');
const router = express.Router();
const {
  generateSharedLink,
  resendSharedLink,
  getSharedLinks,
  revokeSharedLink,
  getGuardianViewData
} = require('../controllers/guardianController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateSharedLink);
router.post('/resend/:id', protect, resendSharedLink);
router.get('/links', protect, getSharedLinks);
router.delete('/links/:id', protect, revokeSharedLink);
router.get('/view/:accessCode', getGuardianViewData); // Public read-only access for observers

module.exports = router;
