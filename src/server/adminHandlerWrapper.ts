import { verifyTeacherSession } from './authService.ts';

/**
 * Wrapper for Admin API Handlers to enforce authentication and handle common logic.
 * Supports both Vercel (req, res) and Express (req, res) implicitly.
 */
export async function withAdminAuth(req: any, res: any, action: (req: any, res: any) => Promise<any>) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Extract Token
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = '';

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.teacher_session) {
    token = req.cookies.teacher_session;
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const [key, val] = c.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    token = cookies.teacher_session;
  }

  // 2. Verify Session
  const isValid = await verifyTeacherSession(token);
  if (!isValid) {
    return res.status(401).json({ 
      success: false, 
      error: 'Yêu cầu quyền đăng nhập giáo viên (Phiên làm việc hết hạn hoặc không hợp lệ)' 
    });
  }

  // 3. Execute Action
  try {
    return await action(req, res);
  } catch (err: any) {
    console.error('[Admin API Error]:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Lỗi hệ thống khi xử lý yêu cầu quản trị' 
    });
  }
}
