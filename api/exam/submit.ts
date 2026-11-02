import { submitExamService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Exam submit endpoint is ready' });
  }

  try {
    const result = await submitExamService(req.body || {});
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Lỗi nộp bài thi' });
  }
}
