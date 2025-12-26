const express = require('express');
const router = express.Router();
const { registerUser, getUsers, deleteUser, getUserProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, registerUser).get(protect, admin, getUsers);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
