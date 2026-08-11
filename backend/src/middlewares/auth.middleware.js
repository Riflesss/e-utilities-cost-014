const jwt = require('jsonwebtoken');

// ตรวจสอบว่ามี Authorization: Bearer <token> แนบมาหรือไม่ และ token ถูกต้องหรือไม่
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'ไม่พบ token กรุณาเข้าสู่ระบบ' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

// ตรวจสอบสิทธิ์เฉพาะ admin (ใช้เสริมกับ authMiddleware เมื่อจำเป็น)
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'ต้องเป็นผู้ดูแลระบบเท่านั้น' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
