const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/otp/request', auth.requestOtpHandler);
router.post('/otp/verify', auth.verifyOtpHandler);
router.get('/me', requireAuth, auth.me);

module.exports = router;
