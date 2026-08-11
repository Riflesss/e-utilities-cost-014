require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // sync โครงสร้างตารางอัตโนมัติ (สำหรับ dev/demo)
    // ใน production ควรใช้ migration แทนการ sync ตรงๆ
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ ซิงค์โครงสร้างฐานข้อมูลสำเร็จ');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server กำลังทำงานที่ port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ เชื่อมต่อฐานข้อมูลไม่สำเร็จ:', err.message);
    process.exit(1);
  }
}

start();
