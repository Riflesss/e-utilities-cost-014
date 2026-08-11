// รันด้วย: npm run seed
// ใส่ข้อมูลเริ่มต้น: ประเภทค่าใช้จ่าย, หมวดเงิน, และผู้ใช้ admin คนแรก
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, ExpenseCategory, BudgetCategory } = require('./models');

const expenseCategories = [
  { name: 'ค่าไฟฟ้า', code: 'ELEC' },
  { name: 'ค่าพลังงาน', code: 'ENERGY' },
  { name: 'ค่าน้ำประปา', code: 'WATER' },
  { name: 'ค่าอินเตอร์เน็ต', code: 'INTERNET' },
  { name: 'ค่าโทรศัพท์', code: 'PHONE' },
  { name: 'ค่าไปรษณีย์', code: 'POST' },
  { name: 'ค่าทิ้งขยะ', code: 'WASTE' },
];

const budgetCategories = [
  { name: 'งบประมาณ (ปวช.)', code: 'BUDGET_PVC' },
  { name: 'งบประมาณ (ปวส.)', code: 'BUDGET_PVS' },
  { name: 'เงินรายได้สถานศึกษา', code: 'SCHOOL_INCOME' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    for (const cat of expenseCategories) {
      await ExpenseCategory.findOrCreate({ where: { code: cat.code }, defaults: cat });
    }
    console.log('✅ seed expense_categories สำเร็จ');

    for (const cat of budgetCategories) {
      await BudgetCategory.findOrCreate({ where: { code: cat.code }, defaults: cat });
    }
    console.log('✅ seed budget_categories สำเร็จ');

    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin1234', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        full_name: 'ผู้ดูแลระบบ',
        role: 'admin',
      });
      console.log('✅ สร้างผู้ใช้ admin สำเร็จ (username: admin / password: admin1234)');
      console.log('⚠️  กรุณาเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก');
    } else {
      console.log('ℹ️  มีผู้ใช้ admin อยู่แล้ว ข้ามการสร้าง');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ seed ข้อมูลไม่สำเร็จ:', err);
    process.exit(1);
  }
}

seed();
