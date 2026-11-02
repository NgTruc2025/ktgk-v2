import { revokeSession } from '../../src/server/authService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle both Express (req.cookies) and Vercel (req.headers.cookie)
  let sessionToken = '';
  if (req.cookies?.teacher_session) {
    sessionToken = req.cookies.teacher_session;
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const [key, val] = c.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    sessionToken = cookies.teacher_session;
  }

  if (sessionToken) {
    await revokeSession(sessionToken);
  }

  // Clear cookie
  res.setHeader('Set-Cookie', 'teacher_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');

  return res.status(200).json({ success: true, message: 'Đã đăng xuất' });
}
