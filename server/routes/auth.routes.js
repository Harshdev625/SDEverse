const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgetPassword} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// secured routes
router.get('/me', protect, getMe);
router,get('/forget-password', protect, forgetPassword);

module.exports = router;
