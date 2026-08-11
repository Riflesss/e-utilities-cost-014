const { Op } = require('sequelize');
const { Expense, ExpenseCategory, BudgetCategory, User } = require('../models');

const includeRelations = [
  { model: ExpenseCategory, as: 'expenseCategory' },
  { model: BudgetCategory, as: 'budgetCategory' },
  { model: User, as: 'creator', attributes: ['id', 'username', 'full_name'] },
];

// GET /api/expenses?month=&year=&expense_category_id=&budget_category_id=&page=&limit=
exports.getAll = async (req, res, next) => {
  try {
    const { month, year, expense_category_id, budget_category_id, page = 1, limit = 20 } = req.query;
    const where = {};

    // กรองตามเดือน/ปีของ billing_month
    if (year) {
      const y = parseInt(year, 10);
      const m = month ? parseInt(month, 10) : null;
      const start = m ? `${y}-${String(m).padStart(2, '0')}-01` : `${y}-01-01`;
      const end = m
        ? new Date(y, m, 0).toISOString().slice(0, 10) // วันสุดท้ายของเดือนนั้น
        : `${y}-12-31`;
      where.billing_month = { [Op.between]: [start, end] };
    }

    if (expense_category_id) where.expense_category_id = expense_category_id;
    if (budget_category_id) where.budget_category_id = budget_category_id;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { rows, count } = await Expense.findAndCountAll({
      where,
      include: includeRelations,
      order: [['billing_month', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses/:id
exports.getOne = async (req, res, next) => {
  try {
    const item = await Expense.findByPk(req.params.id, { include: includeRelations });
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /api/expenses
exports.create = async (req, res, next) => {
  try {
    const {
      expense_category_id, budget_category_id, amount,
      billing_month, paid_date, invoice_no, note,
    } = req.body;

    const uploadedFile = req.file || (req.files && req.files.find((file) => file.fieldname === 'attachment'));
    const attachment_path = uploadedFile ? `/uploads/${uploadedFile.filename}` : req.body.attachment_path || null;

    if (!expense_category_id || !budget_category_id || !amount || !billing_month) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ (ประเภท, หมวดเงิน, จำนวนเงิน, เดือนบิล)' });
    }

    const item = await Expense.create({
      expense_category_id, budget_category_id, amount,
      billing_month, paid_date, invoice_no, note, attachment_path,
      created_by: req.user.id,
    });

    const full = await Expense.findByPk(item.id, { include: includeRelations });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

// PUT /api/expenses/:id
exports.update = async (req, res, next) => {
  try {
    const item = await Expense.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });

    const {
      expense_category_id, budget_category_id, amount,
      billing_month, paid_date, invoice_no, note,
    } = req.body;

    const uploadedFile = req.file || (req.files && req.files.find((file) => file.fieldname === 'attachment'));
    const attachment_path = uploadedFile ? `/uploads/${uploadedFile.filename}` : req.body.attachment_path ?? item.attachment_path;

    await item.update({
      expense_category_id, budget_category_id, amount,
      billing_month, paid_date, invoice_no, note, attachment_path,
    });

    const full = await Expense.findByPk(item.id, { include: includeRelations });
    res.json(full);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/expenses/:id
exports.remove = async (req, res, next) => {
  try {
    const item = await Expense.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
    await item.destroy();
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    next(err);
  }
};
