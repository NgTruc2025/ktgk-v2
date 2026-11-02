import { withAdminAuth } from '../../src/server/adminHandlerWrapper.ts';
import { getExamsService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async () => {
    const result = await getExamsService();
    return res.status(200).json(result);
  });
}
