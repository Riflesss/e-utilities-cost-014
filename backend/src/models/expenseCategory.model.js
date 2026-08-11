const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false }, // เช่น ค่าไฟฟ้า, ค่าน้ำประปา
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true }, // เช่น ELEC, WATER
  unit: { type: DataTypes.STRING(20), defaultValue: 'บาท' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'expense_categories',
  updatedAt: false, // ตารางนี้ไม่มี updated_at ตามที่ออกแบบไว้
});

module.exports = ExpenseCategory;
