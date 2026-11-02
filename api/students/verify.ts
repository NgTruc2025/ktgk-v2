import { verifyStudentService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Student verification endpoint is ready' });
  }

  try {
    const result = await verifyStudentService(req.body || {});
    if (!result.success) {
      return res.status(403).json(result);
    }
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xác thực học sinh' });
  }
}
