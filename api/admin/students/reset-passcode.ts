import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { resetStudentPasscodeService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async () => {
    const { id } = req.query; // For Vercel dynamic routes or query param
    const studentId = id || req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Thiếu mã học sinh' });
    }

    const result = await resetStudentPasscodeService(studentId);
    return res.status(200).json(result);
  });
}
