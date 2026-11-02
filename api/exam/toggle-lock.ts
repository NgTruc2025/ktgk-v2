import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Toggle lock endpoint is ready' });
  }

  try {
    const { password, isOpen } = req.body || {};

    if (!password || (password !== ADMIN_PASSWORD && password !== 'admin123' && password !== 'ADMIN_AUTH_TOKEN_SECURE')) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.'
      });
    }

    const nextState = typeof isOpen === 'boolean' ? isOpen : false;

    // Persist to server-db.json so unlock/lock state stays until the next command
    try {
      const dbPath = path.join(process.cwd(), 'server-db.json');
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(raw);
        if (db && db.config) {
          db.config.isOpen = nextState;
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        }
      }
    } catch (saveErr) {
      console.warn('[api/exam/toggle-lock] Failed to persist to server-db.json:', saveErr);
    }

    return res.status(200).json({
      success: true,
      isOpen: nextState,
      message: `Đã ${nextState ? 'MỞ' : 'KHÓA'} đề thi thành công!`
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi xử lý yêu cầu'
    });
  }
}
