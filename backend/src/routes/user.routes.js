const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/users', userController.getAll);
router.patch('/users/:id/role', userController.updateRole);
router.delete('/users/:id', userController.remove);

module.exports = router;
