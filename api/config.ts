import { getConfigService } from '../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    const config = await getConfigService();
    return res.status(200).json(config);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Lỗi đọc cấu hình' });
  }
}
