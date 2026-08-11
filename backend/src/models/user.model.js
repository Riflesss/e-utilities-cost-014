const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false }, // เก็บเป็น bcrypt hash
  full_name: { type: DataTypes.STRING(100) },
  role: { type: DataTypes.ENUM('admin', 'staff'), defaultValue: 'staff' },
}, {
  tableName: 'users',
});

module.exports = User;
