const { ExpenseCategory } = require('../models');

// GET /api/expense-categories
exports.getAll = async (req, res, next) => {
  try {
    const items = await ExpenseCategory.findAll({ order: [['id', 'ASC']] });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/expense-categories
exports.create = async (req, res, next) => {
  try {
    const { name, code, unit } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อและรหัสของประเภทค่าใช้จ่าย' });
    }
    const item = await ExpenseCategory.create({ name, code, unit });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/expense-categories/:id
exports.update = async (req, res, next) => {
  try {
    const item = await ExpenseCategory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });

    const { name, code, unit, is_active } = req.body;
    await item.update({ name, code, unit, is_active });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/expense-categories/:id
exports.remove = async (req, res, next) => {
  try {
    const item = await ExpenseCategory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
    await item.destroy();
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    next(err);
  }
};
