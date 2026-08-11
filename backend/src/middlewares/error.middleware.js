// จับ error ทั้งหมดที่เกิดขึ้นใน controller แล้วส่งกลับเป็น JSON รูปแบบเดียวกัน
function errorHandler(err, req, res, next) {
  console.error(err);

  // error จาก sequelize validation
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: err.errors?.map((e) => e.message),
    });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'เกิดข้อผิดพลาดในระบบ' });
}

// จับ route ที่ไม่มีอยู่จริง (404)
function notFoundHandler(req, res) {
  res.status(404).json({ message: `ไม่พบ endpoint: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
