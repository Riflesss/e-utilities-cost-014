const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');
const ExpenseCategory = require('./expenseCategory.model');
const BudgetCategory = require('./budgetCategory.model');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expense_category_id: { type: DataTypes.INTEGER, allowNull: false },
  budget_category_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  billing_month: { type: DataTypes.DATEONLY, allowNull: false }, // เก็บเป็นวันที่ 1 ของเดือน
  paid_date: { type: DataTypes.DATEONLY },
  invoice_no: { type: DataTypes.STRING(50) },
  note: { type: DataTypes.TEXT },
  attachment_path: { type: DataTypes.STRING(255) },
  created_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'expenses',
});

// ----- ความสัมพันธ์ (Associations) -----
Expense.belongsTo(ExpenseCategory, { foreignKey: 'expense_category_id', as: 'expenseCategory' });
Expense.belongsTo(BudgetCategory, { foreignKey: 'budget_category_id', as: 'budgetCategory' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

ExpenseCategory.hasMany(Expense, { foreignKey: 'expense_category_id' });
BudgetCategory.hasMany(Expense, { foreignKey: 'budget_category_id' });
User.hasMany(Expense, { foreignKey: 'created_by' });

module.exports = Expense;
