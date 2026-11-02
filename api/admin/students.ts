import { withAdminAuth } from '../../src/server/adminHandlerWrapper.ts';
import { getStudentsService, addStudentService } from '../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method === 'POST') {
      const result = await addStudentService(req.body || {});
      return res.status(200).json(result);
    } else {
      const result = await getStudentsService();
      return res.status(200).json(result);
    }
  });
}
