import { teacherGoogleAuth } from '../../src/server/authService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { idToken } = req.body || {};
    const result = await teacherGoogleAuth(idToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set HttpOnly Secure Cookie
    if (res.setHeader && result.token) {
      const cookieValue = `teacher_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', cookieValue);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xác thực Google' });
  }
}
