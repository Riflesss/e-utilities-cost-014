const sequelize = require('../config/db');
const User = require('./user.model');
const ExpenseCategory = require('./expenseCategory.model');
const BudgetCategory = require('./budgetCategory.model');
const Expense = require('./expense.model'); // ต้อง require หลังสุดเพราะไปตั้ง associations

module.exports = {
  sequelize,
  User,
  ExpenseCategory,
  BudgetCategory,
  Expense,
};
