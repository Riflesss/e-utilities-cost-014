const { User } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'full_name', 'role', 'createdAt'],
      order: [['id', 'ASC']],
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'role ต้องเป็น admin หรือ staff' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }

    if (Number(req.user.id) === Number(user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'ไม่สามารถลดสิทธิ์ตัวเองลงได้' });
    }

    await user.update({ role });
    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (Number(req.user.id) === targetId) {
      return res.status(400).json({ message: 'ไม่สามารถลบบัญชีตัวเองได้' });
    }

    const user = await User.findByPk(targetId);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }

    await user.destroy();
    res.json({ message: 'ลบผู้ใช้งานสำเร็จ' });
  } catch (err) {
    next(err);
  }
};
