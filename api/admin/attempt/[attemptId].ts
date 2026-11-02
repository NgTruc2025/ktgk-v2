import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { getAttemptDetailService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    const { attemptId } = req.query;
    if (!attemptId) {
      return res.status(400).json({ success: false, error: 'Missing attempt ID' });
    }
    
    const result = await getAttemptDetailService(attemptId as string);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  });
}
