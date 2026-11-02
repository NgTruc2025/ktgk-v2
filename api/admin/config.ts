import { withAdminAuth } from '../../src/server/adminHandlerWrapper.ts';
import { getAdminConfigService, saveAdminConfigService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method === 'POST') {
      const result = await saveAdminConfigService(req.body || {});
      return res.status(200).json(result);
    } else {
      const result = await getAdminConfigService();
      return res.status(200).json(result);
    }
  });
}
