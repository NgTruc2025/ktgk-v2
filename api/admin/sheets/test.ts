import { withAdminAuth } from '../../../src/server/adminHandlerWrapper.ts';
import { testGoogleSheetsService } from '../../../src/server/examService.ts';

export default async function handler(req: any, res: any) {
  return withAdminAuth(req, res, async (req) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    const { webAppUrl, secretKey } = req.body || {};
    const result = await testGoogleSheetsService(webAppUrl, secretKey);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  });
}
