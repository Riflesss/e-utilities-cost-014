const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authMiddleware);

router.get('/', expenseController.getAll);
router.post('/', upload.any(), expenseController.create);
router.get('/:id', expenseController.getOne);
router.put('/:id', upload.any(), expenseController.update);
router.delete('/:id', expenseController.remove);

module.exports = router;
