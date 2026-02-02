const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    requestRegistration,
    verifyRegistrationOtp,
    getPendingUsers,
    approveUser,
    getUsers,
    forgotPassword,
    verifyOtp,
    resetPassword,
    initiateChangePassword,
    completeChangePassword,
    deleteUser,
    updateUser,
    getUserProfile,
    getUserCount
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/user-count', getUserCount);
router.post('/login', loginUser);
router.post('/register', protect, admin, upload.single('photo'), registerUser);
router.post('/register-request', upload.single('photo'), requestRegistration);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.get('/pending-users', protect, admin, getPendingUsers);
router.post('/approve-user/:id', protect, admin, approveUser);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, upload.single('photo'), updateUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/change-password-initiate', protect, initiateChangePassword);
router.post('/change-password-complete', protect, completeChangePassword);
router.get('/profile', protect, getUserProfile);

module.exports = router;
