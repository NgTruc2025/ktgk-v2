import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { adjustScoreService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    const result = await adjustScoreService(req.body || {});
    return res.status(200).json(result);
  });
}
