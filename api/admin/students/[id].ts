import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { deleteStudentService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    // Vercel populates query params from dynamic path segments
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing student ID' });
    }
    
    const result = await deleteStudentService(id as string);
    return res.status(200).json(result);
  });
}
