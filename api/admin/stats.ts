import { withAdminAuth } from '../../src/server/adminHandlerWrapper.ts';
import { getStatsService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async () => {
    const result = await getStatsService();
    return res.status(200).json(result);
  });
}
