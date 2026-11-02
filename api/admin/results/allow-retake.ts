import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { allowRetakeService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    const result = await allowRetakeService(req.body?.attemptId);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  });
}
