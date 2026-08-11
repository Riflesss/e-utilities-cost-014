const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BudgetCategory = sequelize.define('BudgetCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false }, // เช่น งบประมาณ (ปวช.)
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'budget_categories',
  updatedAt: false,
});

module.exports = BudgetCategory;
