const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

// GET /api/dashboard/summary?year=
// สรุปยอดรวมรายเดือนทั้งปี (สำหรับกราฟแท่ง/เส้น) + ยอดรวมเดือนนี้/เดือนก่อน
exports.summary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const rows = await sequelize.query(
      `SELECT MONTH(billing_month) AS month, SUM(amount) AS total
       FROM expenses
       WHERE YEAR(billing_month) = :year
       GROUP BY MONTH(billing_month)
       ORDER BY month ASC`,
      { replacements: { year }, type: QueryTypes.SELECT }
    );

    // เติมเดือนที่ไม่มีข้อมูลให้เป็น 0 เพื่อให้กราฟแสดงครบ 12 เดือน
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r) => r.month === i + 1);
      return { month: i + 1, total: found ? parseFloat(found.total) : 0 };
    });

    const yearTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentMonthTotal = year === now.getFullYear()
      ? monthlyTotals.find((m) => m.month === currentMonth)?.total || 0
      : 0;
    const prevMonthTotal = year === now.getFullYear() && currentMonth > 1
      ? monthlyTotals.find((m) => m.month === currentMonth - 1)?.total || 0
      : 0;

    const changePercent = prevMonthTotal > 0
      ? (((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(2)
      : null;

    res.json({
      year,
      monthlyTotals,
      yearTotal,
      currentMonthTotal,
      prevMonthTotal,
      changePercent,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/by-category?year=
// สรุปแยกตามประเภทค่าใช้จ่าย (สำหรับกราฟวงกลม)
exports.byCategory = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const rows = await sequelize.query(
      `SELECT ec.id, ec.name, ec.code, SUM(e.amount) AS total
       FROM expenses e
       JOIN expense_categories ec ON ec.id = e.expense_category_id
       WHERE YEAR(e.billing_month) = :year
       GROUP BY ec.id, ec.name, ec.code
       ORDER BY total DESC`,
      { replacements: { year }, type: QueryTypes.SELECT }
    );

    res.json(rows.map((r) => ({ ...r, total: parseFloat(r.total) })));
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/by-budget?year=
// สรุปแยกตามหมวดเงิน (สำหรับกราฟแท่งซ้อน)
exports.byBudget = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const rows = await sequelize.query(
      `SELECT bc.id, bc.name, bc.code, MONTH(e.billing_month) AS month, SUM(e.amount) AS total
       FROM expenses e
       JOIN budget_categories bc ON bc.id = e.budget_category_id
       WHERE YEAR(e.billing_month) = :year
       GROUP BY bc.id, bc.name, bc.code, MONTH(e.billing_month)
       ORDER BY bc.id ASC, month ASC`,
      { replacements: { year }, type: QueryTypes.SELECT }
    );

    res.json(rows.map((r) => ({ ...r, total: parseFloat(r.total) })));
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/compare?year1=&year2=
// เปรียบเทียบยอดรวมรายเดือนระหว่าง 2 ปี
exports.compare = async (req, res, next) => {
  try {
    const year1 = parseInt(req.query.year1, 10) || new Date().getFullYear() - 1;
    const year2 = parseInt(req.query.year2, 10) || new Date().getFullYear();

    const fetchYearData = async (year) => {
      const rows = await sequelize.query(
        `SELECT MONTH(billing_month) AS month, SUM(amount) AS total
         FROM expenses
         WHERE YEAR(billing_month) = :year
         GROUP BY MONTH(billing_month)`,
        { replacements: { year }, type: QueryTypes.SELECT }
      );
      return Array.from({ length: 12 }, (_, i) => {
        const found = rows.find((r) => r.month === i + 1);
        return found ? parseFloat(found.total) : 0;
      });
    };

    const [data1, data2] = await Promise.all([fetchYearData(year1), fetchYearData(year2)]);

    res.json({
      year1: { year: year1, monthlyTotals: data1, total: data1.reduce((a, b) => a + b, 0) },
      year2: { year: year2, monthlyTotals: data2, total: data2.reduce((a, b) => a + b, 0) },
    });
  } catch (err) {
    next(err);
  }
};
