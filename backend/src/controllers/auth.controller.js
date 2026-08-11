const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// สร้าง accessToken (อายุสั้น) และ refreshToken (อายุยาว)
function generateTokens(user) {
  const payload = { id: user.id, username: user.username, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
}

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // เก็บ refreshToken ใน httpOnly cookie เพื่อป้องกัน XSS อ่านค่าไม่ได้
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    });

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, password, full_name, confirmPassword } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ message: 'กรุณากรอก username, password และชื่อเต็ม' });
    }

    const cleanUsername = username.trim();
    const cleanFullName = full_name.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: 'username ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'ยืนยันรหัสผ่านไม่ตรงกัน' });
    }

    const exists = await User.findOne({ where: { username: cleanUsername } });
    if (exists) {
      return res.status(409).json({ message: 'username นี้มีผู้ใช้งานแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: cleanUsername,
      password: hashedPassword,
      full_name: cleanFullName,
      role: 'staff',
    });

    res.status(201).json({
      message: 'สร้างผู้ใช้สำเร็จ',
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'ออกจากระบบสำเร็จ' });
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'ไม่พบ refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'refresh token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'full_name', 'role'],
    });
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
