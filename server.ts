import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';

// Services
import { 
  getConfigService, 
  toggleLockService, 
  verifyStudentService, 
  startExamService, 
  saveProgressService, 
  logEventService, 
  submitExamService,
  getResultsService,
  getAttemptDetailService,
  adjustScoreService,
  allowRetakeService,
  getStudentsService,
  addStudentService,
  importStudentsService,
  deleteStudentService,
  getExamsService,
  getAdminConfigService,
  saveAdminConfigService,
  testGoogleSheetsService,
  syncAllToSheetsService,
  getLogsService,
  getStatsService,
  addAuditLog,
  resetStudentPasscodeService
} from './src/server/examService.ts';
import { verifyTeacherSession, revokeSession, teacherGoogleAuth } from './src/server/authService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// CORS & Preflight handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// MIDDLEWARE: Require Teacher Auth (Cookie or Header)
async function requireTeacherAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionCookie = req.cookies?.teacher_session;
  
  let token = sessionCookie;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const isValid = await verifyTeacherSession(token);
  if (isValid) {
    return next();
  }

  return res.status(401).json({ success: false, error: 'Yêu cầu quyền đăng nhập giáo viên (Phiên làm việc hết hạn)' });
}

// ==========================================
// 1. PUBLIC & STUDENT APIS
// ==========================================

app.get('/api/config', async (req, res) => {
  try {
    const config = await getConfigService();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exam/toggle-lock', async (req, res) => {
  try {
    const { password, isOpen } = req.body || {};
    const result = await toggleLockService(password, isOpen);
    if (!result.success) return res.status(401).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/verify', async (req, res) => {
  try {
    const result = await verifyStudentService(req.body || {});
    if (!result.success) return res.status(403).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/exam/start', async (req, res) => {
  try {
    const result = await startExamService(req.body || {});
    if (!result.success) return res.status(403).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/exam/save-progress', async (req, res) => {
  try {
    const result = await saveProgressService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/exam/log-event', async (req, res) => {
  try {
    const result = await logEventService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/exam/submit', async (req, res) => {
  try {
    const result = await submitExamService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. TEACHER ADMIN APIS (PROTECTED)
// ==========================================

// Google Auth
app.post('/api/admin/google-auth', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const result = await teacherGoogleAuth(idToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set HttpOnly Secure Cookie
    if (result.token) {
      const cookieValue = `teacher_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', cookieValue);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xác thực Google' });
  }
});

// Logout
app.post('/api/admin/logout', async (req, res) => {
  const token = req.cookies?.teacher_session;
  if (token) {
    await revokeSession(token);
  }
  res.clearCookie('teacher_session');
  res.json({ success: true, message: 'Đã đăng xuất' });
});

app.get('/api/admin/results', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getResultsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/attempt/:attemptId', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getAttemptDetailService(req.params.attemptId);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/results/adjust', requireTeacherAuth, async (req, res) => {
  try {
    const result = await adjustScoreService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/results/allow-retake', requireTeacherAuth, async (req, res) => {
  try {
    const result = await allowRetakeService(req.body?.attemptId);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/students', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getStudentsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/students', requireTeacherAuth, async (req, res) => {
  try {
    const result = await addStudentService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/students/import', requireTeacherAuth, async (req, res) => {
  try {
    const result = await importStudentsService(req.body?.students || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/students/reset-passcode', requireTeacherAuth, async (req, res) => {
  try {
    const { studentId } = req.body || {};
    const result = await resetStudentPasscodeService(studentId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/students/:id', requireTeacherAuth, async (req, res) => {
  try {
    const result = await deleteStudentService(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/exams', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getExamsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/config', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getAdminConfigService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/config', requireTeacherAuth, async (req, res) => {
  try {
    const result = await saveAdminConfigService(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/sheets/test', requireTeacherAuth, async (req, res) => {
  try {
    const { webAppUrl, secretKey } = req.body || {};
    const result = await testGoogleSheetsService(webAppUrl, secretKey);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/sheets/sync-all', requireTeacherAuth, async (req, res) => {
  try {
    const result = await syncAllToSheetsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/logs', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getLogsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/stats', requireTeacherAuth, async (req, res) => {
  try {
    const result = await getStatsService();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`KTTX11 PRO v2.0 - HỆ THỐNG KIỂM TRA TIN HỌC`);
    console.log(`Trường THPT Giá Rai - Phân hiệu Nguyễn Trung Trực`);
    console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Lỗi khởi động máy chủ:', err);
});
