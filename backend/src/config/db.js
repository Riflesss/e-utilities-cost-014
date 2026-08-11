// การตั้งค่าการเชื่อมต่อฐานข้อมูล MariaDB ผ่าน Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'e_utilities_cost',
  process.env.DB_USER || 'app_user',
  process.env.DB_PASSWORD || 'changeme',
  {
    host: process.env.DB_HOST || 'mariadb',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // mysql2 driver รองรับ MariaDB ได้เต็มรูปแบบ
    logging: false,
    define: {
      underscored: true, // ใช้ snake_case ในชื่อคอลัมน์ (เช่น created_at)
      timestamps: true,
    },
  }
);

module.exports = sequelize;
