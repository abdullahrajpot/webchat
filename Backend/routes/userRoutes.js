const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUsersByRole,
  getUserById
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.get('/role/:role', getUsersByRole);
router.get('/:id', getUserById);

module.exports = router;
