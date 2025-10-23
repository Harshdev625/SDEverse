const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, validateOTP, resetPassword} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
