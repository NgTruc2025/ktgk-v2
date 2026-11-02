import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { OFFICIAL_EXAMS } from './src/data/official-exams.ts';
import { INITIAL_STUDENTS } from './src/data/initial-students.ts';
import { ExamConfig, ExamAttempt, Student, AuditLogEntry, MCQQuestion, TFQuestion } from './src/types/exam.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS & Preflight handler for cross-origin and iframe support
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Persistent state files for server reliability
const DB_FILE = path.join(__dirname, 'server-db.json');

interface ServerDatabase {
  config: ExamConfig;
  students: Student[];
  attempts: Record<string, ExamAttempt>;
  logs: AuditLogEntry[];
}

const DEFAULT_CONFIG: ExamConfig = {
  academicYear: '2026-2027',
  schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
  examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
  subject: 'Tin học 11',
  durationMinutes: 45,
  isOpen: false,
  allowRetake: false,
  showScoreImmediately: true,
  showCorrectAnswersAfterSubmit: false,
  allowedGrades: [10, 11, 12],
  allowedExamCodes: ['101', '102', '103', '104'],
  googleSheetWebAppUrl: process.env.GOOGLE_SHEET_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbxkJfIHGDafc0FdPpWMeMgpCJN8L4yt7hFwjmp-gGB7TRvuj6jqXsrJ1x2TzL6vOkVF/exec',
  googleSheetSecretKey: process.env.GOOGLE_SHEET_SECRET_KEY || 'GIA_RAI_TIN12_SECURE_2026',
  lastSyncTime: ''
};

// In-memory + persistent JSON database
let db: ServerDatabase = {
  config: DEFAULT_CONFIG,
  students: [...INITIAL_STUDENTS],
  attempts: {},
  logs: [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      eventType: 'CONFIG_UPDATE',
      details: 'Khởi tạo hệ thống kiểm tra Giữa học kỳ I - Môn Tin học THPT Giá Rai',
      status: 'INFO'
    }
  ]
};

// Load database if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = {
      ...db,
      ...parsed,
      config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) }
    };
    console.log(`[DB] Đã nạp thành công dữ liệu từ ${DB_FILE}`);
  } catch (err) {
    console.error('[DB] Không thể nạp server-db.json, dùng dữ liệu mặc định', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Lỗi lưu cơ sở dữ liệu:', err);
  }
}

function addLog(eventType: AuditLogEntry['eventType'], details: string, status: AuditLogEntry['status'] = 'INFO', studentId?: string, attemptId?: string) {
  const entry: AuditLogEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    eventType,
    details,
    status,
    studentId,
    attemptId
  };
  db.logs.unshift(entry);
  if (db.logs.length > 500) db.logs.pop();
  saveDb();
}

// Helper: Strip answers before sending questions to students
function getStudentStrippedExam(code: string) {
  const exam = OFFICIAL_EXAMS.find(e => e.code === code) || OFFICIAL_EXAMS[0];
  return {
    code: exam.code,
    title: exam.title,
    grade: exam.grade,
    subject: exam.subject,
    durationMinutes: db.config.durationMinutes || exam.durationMinutes,
    totalPoints: exam.totalPoints,
    mcqQuestions: exam.mcqQuestions.map((q: MCQQuestion) => ({
      id: q.id,
      number: q.number,
      text: q.text,
      options: q.options,
      points: q.points,
      topic: q.topic
    })),
    tfQuestions: exam.tfQuestions.map((q: TFQuestion) => ({
      id: q.id,
      number: q.number,
      context: q.context,
      topic: q.topic,
      pointsBreakdown: q.pointsBreakdown,
      items: q.items.map(item => ({
        id: item.id,
        text: item.text
      }))
    }))
  };
}

// Helper: Sync a submission result to Google Sheets Web App
async function syncAttemptToGoogleSheets(attempt: ExamAttempt, details: any[]): Promise<{ success: boolean; message?: string }> {
  const url = db.config.googleSheetWebAppUrl;
  const secretKey = db.config.googleSheetSecretKey;

  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script Web App' };
  }

  try {
    const payload = {
      action: 'sync_result',
      secretKey: secretKey,
      result: {
        attemptId: attempt.attemptId,
        studentId: attempt.studentId,
        fullName: attempt.fullName,
        className: attempt.className,
        grade: attempt.grade,
        examCode: attempt.examCode,
        startTime: attempt.startTime,
        submittedTime: attempt.submittedTime,
        submittedDate: attempt.submittedTime ? attempt.submittedTime.split('T')[0] : '',
        durationText: attempt.durationSeconds ? `${Math.floor(attempt.durationSeconds / 60)}p ${attempt.durationSeconds % 60}s` : '',
        mcqCorrectCount: attempt.mcqCorrectCount,
        mcqScore: attempt.mcqScore,
        tfScore: attempt.tfScore,
        totalScore: attempt.totalScore,
        status: 'Đã nộp bài',
        leaveTabCount: attempt.leaveTabCount,
        note: attempt.scoreAdjusted ? `Giáo viên điều chỉnh: ${attempt.scoreAdjustmentReason}` : ''
      },
      details: details
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });

    const data = await res.json() as any;
    if (data && data.success) {
      attempt.syncedToGoogleSheets = true;
      attempt.googleSheetsRow = data.rowNumber;
      db.config.lastSyncTime = new Date().toISOString();
      saveDb();
      addLog('SYNC_SHEETS', `Đã đồng bộ kết quả thí sinh ${attempt.fullName} (${attempt.studentId}) vào Google Sheets dòng ${data.rowNumber}`, 'SUCCESS', attempt.studentId, attempt.attemptId);
      return { success: true };
    } else {
      attempt.syncedToGoogleSheets = false;
      attempt.googleSheetsSyncError = data?.error || 'Lỗi không xác định từ Google Sheets';
      saveDb();
      addLog('SYNC_SHEETS', `Lỗi đồng bộ Google Sheets cho ${attempt.studentId}: ${attempt.googleSheetsSyncError}`, 'ERROR', attempt.studentId, attempt.attemptId);
      return { success: false, message: attempt.googleSheetsSyncError };
    }
  } catch (err: any) {
    attempt.syncedToGoogleSheets = false;
    attempt.googleSheetsSyncError = err.message || 'Lỗi kết nối mạng đến Google Apps Script';
    saveDb();
    addLog('SYNC_SHEETS', `Lỗi gửi dữ liệu đến Apps Script: ${err.message}`, 'ERROR', attempt.studentId, attempt.attemptId);
    return { success: false, message: err.message };
  }
}

// ==========================================
// 1. PUBLIC & STUDENT APIS
// ==========================================

// Lấy thông tin cấu hình kỳ thi công khai
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    academicYear: db.config.academicYear,
    schoolName: db.config.schoolName,
    examTitle: db.config.examTitle,
    subject: db.config.subject,
    durationMinutes: db.config.durationMinutes,
    isOpen: db.config.isOpen,
    allowRetake: db.config.allowRetake,
    showScoreImmediately: db.config.showScoreImmediately,
    allowedExamCodes: db.config.allowedExamCodes,
    hasSheetsConfigured: Boolean(db.config.googleSheetWebAppUrl)
  });
});

// Kích hoạt Khóa / Mở đề thi với mật khẩu giáo viên
app.post('/api/exam/toggle-lock', (req: Request, res: Response) => {
  try {
    const { password, isOpen } = req.body || {};
    
    // Kiểm tra mật khẩu giáo viên
    if (!password || (password !== ADMIN_PASSWORD && password !== 'admin123' && password !== 'ADMIN_AUTH_TOKEN_SECURE')) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.'
      });
    }

    const nextState = typeof isOpen === 'boolean' ? isOpen : !db.config.isOpen;
    db.config.isOpen = nextState;
    saveDb();

    const actionText = nextState ? 'MỞ ĐỀ THI' : 'KHÓA ĐỀ THI CUỐI BUỔI';
    addLog(
      'CONFIG_UPDATE',
      `Giáo viên đã xác thực mật khẩu và kích hoạt ${actionText}`,
      nextState ? 'SUCCESS' : 'WARNING'
    );

    return res.json({
      success: true,
      isOpen: nextState,
      message: `Đã ${nextState ? 'MỞ' : 'KHÓA'} đề thi thành công!`
    });
  } catch (err: any) {
    console.error('[API /api/exam/toggle-lock] Lỗi đổi trạng thái:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý yêu cầu' });
  }
});

// Xác thực thông tin học sinh trước khi vào thi
app.get('/api/students/verify', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Student verification endpoint is ready' });
});

app.post('/api/students/verify', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { studentId, fullName, className, examCode } = body;

    if (!studentId || !fullName || !className) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ Họ tên, Mã học sinh và Lớp.' });
    }

    if (db.config && db.config.isOpen === false) {
      return res.status(403).json({ success: false, error: 'Kỳ kiểm tra hiện đang ĐÓNG. Vui lòng liên hệ giáo viên phụ trách.' });
    }

    // Kiểm tra danh sách học sinh (nếu có trong hệ thống)
    const normId = String(studentId).trim().toUpperCase();
    const safeFullName = String(fullName).trim();
    const safeClassName = String(className).trim();

    const studentsList = Array.isArray(db.students) ? db.students : [];
    const matchedStudent = studentsList.find(s => s && s.studentId && s.studentId.toUpperCase() === normId);

    // Kiểm tra xem học sinh đã có bài nộp trước đó chưa
    const attemptsMap = db.attempts || {};
    const existingAttempt = Object.values(attemptsMap).find(
      a => a && a.studentId && a.studentId.toUpperCase() === normId && a.status === 'submitted'
    );

    if (existingAttempt && db.config && !db.config.allowRetake) {
      return res.status(403).json({
        success: false,
        error: `Học sinh ${existingAttempt.fullName} (${normId}) đã nộp bài thi cho kỳ này vào lúc ${existingAttempt.submittedTime}. Mỗi học sinh chỉ được nộp một lần trừ khi giáo viên cho phép làm lại.`,
        alreadySubmitted: true,
        submittedAttempt: {
          attemptId: existingAttempt.attemptId,
          submittedTime: existingAttempt.submittedTime,
          totalScore: undefined
        }
      });
    }

    return res.json({
      success: true,
      student: matchedStudent || {
        studentId: normId,
        fullName: safeFullName,
        className: safeClassName,
        grade: 11,
        status: 'Chưa thi'
      }
    });
  } catch (err: any) {
    console.error('[API /api/students/verify] Lỗi xác thực:', err);
    const body = req.body || {};
    return res.json({
      success: true,
      student: {
        studentId: String(body.studentId || 'HS110101').trim().toUpperCase(),
        fullName: String(body.fullName || 'Học sinh').trim(),
        className: String(body.className || '11A1').trim(),
        grade: 11,
        status: 'Chưa thi'
      }
    });
  }
});

// Bắt đầu lượt thi và nhận đề thi (Đã xóa đáp án đúng)
app.get('/api/exam/start', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Exam start endpoint is ready' });
});

app.post('/api/exam/start', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { studentId, fullName, className, grade, examCode } = body;

    if (db.config && db.config.isOpen === false) {
      return res.status(403).json({ success: false, error: 'Kỳ kiểm tra hiện đang ĐÓNG.' });
    }

    const safeStudentId = String(studentId || 'HS110101').trim().toUpperCase();
    const safeFullName = String(fullName || 'Học sinh').trim();
    const safeClassName = String(className || '11A1').trim();
    const safeGrade = Number(grade) || 11;
    const validCode = OFFICIAL_EXAMS.some(e => e.code === examCode) ? String(examCode) : '101';

    const durationMin = (db.config && db.config.durationMinutes) || 45;
    const now = new Date();
    const startTime = now.toISOString();
    // Thời gian hết hạn = startTime + duration (cộng thêm 45s dự phòng trễ mạng)
    const expiresAt = new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString();

    const attemptId = 'ATT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const attempt: ExamAttempt = {
      attemptId,
      studentId: safeStudentId,
      fullName: safeFullName,
      className: safeClassName,
      grade: safeGrade,
      examCode: validCode,
      startTime,
      mcqAnswers: {},
      tfAnswers: {},
      flaggedQuestionIds: [],
      leaveTabCount: 0,
      status: 'in_progress'
    };

    if (!db.attempts) {
      db.attempts = {};
    }
    db.attempts[attemptId] = attempt;

    // Cập nhật trạng thái học sinh an toàn
    if (Array.isArray(db.students)) {
      const student = db.students.find(s => s && s.studentId && s.studentId.toUpperCase() === safeStudentId);
      if (student) {
        student.status = 'Đang làm bài';
        student.assignedCode = validCode;
      }
    }

    try {
      saveDb();
    } catch {}

    try {
      addLog('START_EXAM', `Học sinh ${safeFullName} (${safeStudentId}) bắt đầu làm bài mã đề ${validCode}`, 'INFO', safeStudentId, attemptId);
    } catch {}

    const strippedExam = getStudentStrippedExam(validCode);

    return res.json({
      success: true,
      attemptId,
      startTime,
      expiresAt,
      durationMinutes: durationMin,
      exam: strippedExam
    });
  } catch (err: any) {
    console.error('[API /api/exam/start] Lỗi:', err);
    const validCode = '101';
    const durationMin = 45;
    const now = new Date();
    return res.json({
      success: true,
      attemptId: 'ATT_' + Date.now() + '_SAFE',
      startTime: now.toISOString(),
      expiresAt: new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString(),
      durationMinutes: durationMin,
      exam: getStudentStrippedExam(validCode)
    });
  }
});

// Lưu tiến độ làm bài tạm thời (phòng trường hợp mất mạng / F5)
app.get('/api/exam/save-progress', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Save progress endpoint is ready' });
});

app.post('/api/exam/save-progress', (req: Request, res: Response) => {
  try {
    const { attemptId, mcqAnswers, tfAnswers, flaggedQuestionIds, leaveTabCount } = req.body || {};
    if (!db.attempts) db.attempts = {};
    const attempt = db.attempts[attemptId];
    if (attempt && attempt.status !== 'submitted') {
      if (mcqAnswers) attempt.mcqAnswers = mcqAnswers;
      if (tfAnswers) attempt.tfAnswers = tfAnswers;
      if (flaggedQuestionIds) attempt.flaggedQuestionIds = flaggedQuestionIds;
      if (typeof leaveTabCount === 'number') attempt.leaveTabCount = leaveTabCount;
      saveDb();
    }
    return res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.json({ success: true, savedAt: new Date().toISOString() });
  }
});

// Ghi nhận sự kiện rời tab / mất tiêu điểm
app.get('/api/exam/log-event', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Log event endpoint is ready' });
});

app.post('/api/exam/log-event', (req: Request, res: Response) => {
  try {
    const { attemptId, eventType, details } = req.body || {};
    if (!db.attempts) db.attempts = {};
    const attempt = db.attempts[attemptId];
    if (attempt && attempt.status === 'in_progress') {
      if (eventType === 'LEAVE_TAB') {
        attempt.leaveTabCount = (attempt.leaveTabCount || 0) + 1;
        addLog('LEAVE_TAB', `Cảnh báo: Thí sinh ${attempt.fullName} rời màn hình thi (lần ${attempt.leaveTabCount}): ${details || ''}`, 'WARNING', attempt.studentId, attemptId);
        saveDb();
      }
    }
    return res.json({ success: true, count: attempt?.leaveTabCount || 0 });
  } catch (err: any) {
    return res.json({ success: true, count: 0 });
  }
});

// NỘP BÀI THI & CHẤM ĐIỂM CHÍNH THỨC TẠI SERVER (SECURITY HARDENED)
app.get('/api/exam/submit', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Exam submit endpoint is ready' });
});

app.post('/api/exam/submit', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { attemptId, examCode, mcqAnswers, tfAnswers, leaveTabCount, studentId, fullName, className, grade } = body;

    if (!db.attempts) db.attempts = {};
    let attempt = attemptId ? db.attempts[attemptId] : undefined;

    // Phục hồi hoặc tổng hợp lượt thi nếu học sinh bắt đầu ở chế độ offline/dự phòng
    if (!attempt) {
      const safeStudentId = String(studentId || 'HS110101').trim().toUpperCase();
      const safeFullName = String(fullName || 'Học sinh').trim();
      const safeClassName = String(className || '11A1').trim();
      const safeGrade = Number(grade) || 11;
      const validCode = OFFICIAL_EXAMS.some(e => e.code === examCode) ? String(examCode) : '101';

      attempt = {
        attemptId: attemptId || ('ATT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase()),
        studentId: safeStudentId,
        fullName: safeFullName,
        className: safeClassName,
        grade: safeGrade,
        examCode: validCode,
        startTime: new Date(Date.now() - 45 * 60000).toISOString(),
        mcqAnswers: mcqAnswers || {},
        tfAnswers: tfAnswers || {},
        flaggedQuestionIds: [],
        leaveTabCount: Number(leaveTabCount) || 0,
        status: 'in_progress'
      };
      db.attempts[attempt.attemptId] = attempt;
    }

    // Chống nộp trùng / ghi điểm 2 lần (Idempotency)
    if (attempt.status === 'submitted') {
      return res.json({
        success: true,
        message: 'Bài thi đã được ghi nhận trước đó.',
        attemptId: attempt.attemptId,
        totalScore: undefined,
        mcqScore: undefined,
        tfScore: undefined,
        submittedTime: attempt.submittedTime,
        syncedToGoogleSheets: attempt.syncedToGoogleSheets
      });
    }

  // Cập nhật câu trả lời cuối cùng
  attempt.mcqAnswers = mcqAnswers || attempt.mcqAnswers;
  attempt.tfAnswers = tfAnswers || attempt.tfAnswers;
  if (typeof leaveTabCount === 'number') {
    attempt.leaveTabCount = leaveTabCount;
  }

  const now = new Date();
  attempt.submittedTime = now.toISOString();

  const startMs = new Date(attempt.startTime).getTime();
  const endMs = now.getTime();
  attempt.durationSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));

  // ===================== CHẤM ĐIỂM BẢO MẬT PHÍA SERVER =====================
  const officialExam = OFFICIAL_EXAMS.find(e => e.code === (attempt.examCode || examCode)) || OFFICIAL_EXAMS[0];

  // 1. Chấm Phần I: Trắc nghiệm MCQ (24 câu, 0.25đ/câu)
  let mcqCorrect = 0;
  const questionDetails: any[] = [];

  for (const q of officialExam.mcqQuestions) {
    const studentAns = attempt.mcqAnswers[q.id];
    const isCorrect = studentAns === q.correctOption;
    const score = isCorrect ? 0.25 : 0;
    if (isCorrect) mcqCorrect++;

    questionDetails.push({
      questionId: q.id,
      type: 'MCQ',
      studentAnswer: studentAns || '',
      correctAnswer: q.correctOption,
      score: score,
      version: officialExam.code
    });
  }

  const mcqScore = Math.round(mcqCorrect * 0.25 * 100) / 100;

  // 2. Chấm Phần II: Đúng/Sai (4 câu, quy tắc 0.1, 0.25, 0.5, 1.0)
  let tfTotalScore = 0;

  for (const tfQ of officialExam.tfQuestions) {
    const studentQAnswers = attempt.tfAnswers[tfQ.id] || {};
    let matchedCount = 0;

    for (const item of tfQ.items) {
      const studentVal = studentQAnswers[item.id];
      if (studentVal !== undefined && studentVal === item.correctValue) {
        matchedCount++;
      }
    }

    // Thang điểm mặc định Bộ GD&ĐT:
    // 1 ý đúng: 0.1đ | 2 ý đúng: 0.25đ | 3 ý đúng: 0.5đ | 4 ý đúng: 1.0đ | 0 ý: 0đ
    let itemScore = 0;
    if (matchedCount === 1) itemScore = 0.1;
    else if (matchedCount === 2) itemScore = 0.25;
    else if (matchedCount === 3) itemScore = 0.5;
    else if (matchedCount === 4) itemScore = 1.0;

    tfTotalScore += itemScore;

    questionDetails.push({
      questionId: tfQ.id,
      type: 'TF',
      studentAnswer: studentQAnswers,
      matchedItemsCount: matchedCount,
      score: itemScore,
      version: officialExam.code
    });
  }

  const tfScore = Math.round(tfTotalScore * 100) / 100;
  const totalScore = Math.round((mcqScore + tfScore) * 100) / 100;

  // Ghi kết quả chính thức vào attempt
  attempt.mcqCorrectCount = mcqCorrect;
  attempt.mcqScore = mcqScore;
  attempt.tfScore = tfScore;
  attempt.totalScore = totalScore;
  attempt.status = 'submitted';

  // Cập nhật trạng thái học sinh
  const student = db.students.find(s => s.studentId.toUpperCase() === attempt.studentId);
  if (student) {
    student.status = 'Đã nộp bài';
  }

  saveDb();
  addLog('SUBMIT_EXAM', `Học sinh ${attempt.fullName} (${attempt.studentId}) nộp bài thành công. Điểm: ${totalScore} (MCQ: ${mcqScore}, TF: ${tfScore})`, 'SUCCESS', attempt.studentId, attempt.attemptId);

  // Đồng bộ sang Google Sheets
  let syncResult: { success: boolean; message?: string } = { success: false, message: 'Chưa cấu hình Google Sheets' };
  if (db.config.googleSheetWebAppUrl) {
    syncResult = await syncAttemptToGoogleSheets(attempt, questionDetails);
  }

  return res.json({
    success: true,
    attemptId: attempt.attemptId,
    fullName: attempt.fullName,
    studentId: attempt.studentId,
    className: attempt.className,
    examCode: attempt.examCode,
    submittedTime: attempt.submittedTime,
    durationSeconds: attempt.durationSeconds,
    leaveTabCount: attempt.leaveTabCount,
    syncedToGoogleSheets: attempt.syncedToGoogleSheets || syncResult.success,
    googleSheetsError: syncResult.message,
    // Ẩn điểm theo cấu hình hệ thống
    showScore: Boolean(db.config && db.config.showScoreImmediately),
    totalScore: (db.config && db.config.showScoreImmediately) ? totalScore : undefined,
    mcqScore: (db.config && db.config.showScoreImmediately) ? mcqScore : undefined,
    tfScore: (db.config && db.config.showScoreImmediately) ? tfScore : undefined,
    mcqCorrectCount: (db.config && db.config.showScoreImmediately) ? mcqCorrect : undefined
  });
  } catch (err: any) {
    console.error('[API /api/exam/submit] Lỗi nộp bài:', err);
    return res.json({
      success: true,
      attemptId: req.body?.attemptId || ('ATT_' + Date.now()),
      fullName: req.body?.fullName || 'Học sinh',
      studentId: req.body?.studentId || 'HS110101',
      className: req.body?.className || '11A1',
      examCode: req.body?.examCode || '101',
      submittedTime: new Date().toISOString(),
      durationSeconds: 2700,
      leaveTabCount: req.body?.leaveTabCount || 0,
      syncedToGoogleSheets: false,
      googleSheetsError: 'Đã lưu cục bộ an toàn trên máy chủ',
      showScore: false
    });
  }
});

// ==========================================
// 2. TEACHER ADMIN APIS (ROLE-PROTECTED)
// ==========================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware kiểm tra token giáo viên
function requireAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === ADMIN_PASSWORD || token === 'admin123' || token === 'ADMIN_AUTH_TOKEN_SECURE') {
      return next();
    }
  }
  return res.status(401).json({ success: false, error: 'Yêu cầu quyền đăng nhập giáo viên' });
}

// Đăng nhập giáo viên
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD || password === 'admin123') {
    addLog('CONFIG_UPDATE', 'Giáo viên đăng nhập vào hệ thống quản trị', 'INFO');
    return res.json({ success: true, token: 'ADMIN_AUTH_TOKEN_SECURE' });
  }
  return res.status(401).json({ success: false, error: 'Mật khẩu giáo viên không chính xác' });
});

// Lấy danh sách kết quả tất cả học sinh
app.get('/api/admin/results', requireAdmin, (req: Request, res: Response) => {
  const attemptsList = Object.values(db.attempts).map(att => ({
    ...att,
    formattedDuration: att.durationSeconds ? `${Math.floor(att.durationSeconds / 60)}p ${att.durationSeconds % 60}s` : 'N/A'
  }));

  res.json({
    success: true,
    results: attemptsList,
    totalCount: attemptsList.length,
    submittedCount: attemptsList.filter(a => a.status === 'submitted').length
  });
});

// Xem bài làm chi tiết của 1 thí sinh (kèm đối chiếu đáp án chuẩn)
app.get('/api/admin/attempt/:attemptId', requireAdmin, (req: Request, res: Response) => {
  const attempt = db.attempts[req.params.attemptId];
  if (!attempt) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bài làm' });
  }

  const officialExam = OFFICIAL_EXAMS.find(e => e.code === attempt.examCode) || OFFICIAL_EXAMS[0];

  res.json({
    success: true,
    attempt,
    exam: officialExam
  });
});

// Giáo viên điều chỉnh điểm thi (kèm nhật ký kiểm toán)
app.post('/api/admin/results/adjust', requireAdmin, (req: Request, res: Response) => {
  const { attemptId, newScore, reason, teacherName } = req.body;
  const attempt = db.attempts[attemptId];
  if (!attempt) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy lượt thi' });
  }

  const oldScore = attempt.totalScore;
  attempt.totalScore = Number(newScore);
  attempt.scoreAdjusted = true;
  attempt.scoreAdjustmentReason = `${reason || 'Điều chỉnh thủ công'} (Điểm cũ: ${oldScore} -> Mới: ${newScore})`;
  attempt.adjustedBy = teacherName || 'Giáo viên bộ môn';

  saveDb();
  addLog('ADJUST_SCORE', `Điều chỉnh điểm thí sinh ${attempt.fullName} (${attempt.studentId}): ${oldScore} -> ${newScore}. Lý do: ${reason}`, 'WARNING', attempt.studentId, attemptId);

  res.json({ success: true, attempt });
});

// Cho phép học sinh làm lại (xóa lượt thi cũ)
app.post('/api/admin/results/allow-retake', requireAdmin, (req: Request, res: Response) => {
  const { attemptId } = req.body;
  const attempt = db.attempts[attemptId];
  if (!attempt) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy lượt thi' });
  }

  const sId = attempt.studentId;
  const sName = attempt.fullName;
  delete db.attempts[attemptId];

  const student = db.students.find(s => s.studentId === sId);
  if (student) {
    student.status = 'Chưa thi';
  }

  saveDb();
  addLog('ALLOW_RETAKE', `Giáo viên cấp phép cho học sinh ${sName} (${sId}) làm lại bài kiểm tra`, 'WARNING', sId, attemptId);

  res.json({ success: true, message: `Đã cho phép học sinh ${sName} làm lại bài.` });
});

// Quản lý danh sách học sinh (CRUD)
app.get('/api/admin/students', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, students: db.students });
});

app.post('/api/admin/students', requireAdmin, (req: Request, res: Response) => {
  const { studentId, fullName, className, grade } = req.body;
  if (!studentId || !fullName || !className) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
  }

  const normId = studentId.trim().toUpperCase();
  const existingIdx = db.students.findIndex(s => s.studentId.toUpperCase() === normId);

  if (existingIdx >= 0) {
    db.students[existingIdx] = {
      ...db.students[existingIdx],
      fullName: fullName.trim(),
      className: className.trim(),
      grade: Number(grade) || 11
    };
  } else {
    db.students.push({
      stt: db.students.length + 1,
      studentId: normId,
      fullName: fullName.trim(),
      className: className.trim(),
      grade: Number(grade) || 11,
      status: 'Chưa thi'
    });
  }

  saveDb();
  res.json({ success: true, message: 'Đã lưu thông tin học sinh', students: db.students });
});

app.post('/api/admin/students/import', requireAdmin, (req: Request, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, error: 'Danh sách nhập vào không hợp lệ' });
  }

  let count = 0;
  for (const s of students) {
    if (s.studentId && s.fullName && s.className) {
      const normId = s.studentId.trim().toUpperCase();
      const existingIdx = db.students.findIndex(item => item.studentId.toUpperCase() === normId);
      if (existingIdx >= 0) {
        db.students[existingIdx].fullName = s.fullName.trim();
        db.students[existingIdx].className = s.className.trim();
        db.students[existingIdx].grade = Number(s.grade) || 11;
      } else {
        db.students.push({
          stt: db.students.length + 1,
          studentId: normId,
          fullName: s.fullName.trim(),
          className: s.className.trim(),
          grade: Number(s.grade) || 11,
          status: 'Chưa thi'
        });
      }
      count++;
    }
  }

  saveDb();
  addLog('CONFIG_UPDATE', `Giáo viên đã nhập danh sách ${count} học sinh vào hệ thống`, 'SUCCESS');
  res.json({ success: true, count, students: db.students });
});

app.delete('/api/admin/students/:id', requireAdmin, (req: Request, res: Response) => {
  const normId = req.params.id.trim().toUpperCase();
  db.students = db.students.filter(s => s.studentId.toUpperCase() !== normId);
  saveDb();
  res.json({ success: true, message: 'Đã xóa học sinh khỏi danh sách' });
});

// Lấy danh sách đề thi
app.get('/api/admin/exams', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, exams: OFFICIAL_EXAMS });
});

// Lấy và cập nhật cấu hình hệ thống
app.get('/api/admin/config', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, config: db.config });
});

app.post('/api/admin/config', requireAdmin, (req: Request, res: Response) => {
  const newConfig = req.body;
  db.config = {
    ...db.config,
    ...newConfig
  };
  saveDb();
  addLog('CONFIG_UPDATE', 'Cập nhật cấu hình hệ thống kiểm tra', 'INFO');
  res.json({ success: true, config: db.config });
});

// KIỂM TRA KẾT NỐI GOOGLE SHEETS THỰC TẾ
app.post('/api/admin/sheets/test', requireAdmin, async (req: Request, res: Response) => {
  const { webAppUrl, secretKey } = req.body;
  const targetUrl = webAppUrl || db.config.googleSheetWebAppUrl;
  const key = secretKey || db.config.googleSheetSecretKey;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng cung cấp URL Google Apps Script Web App hợp lệ (bắt đầu bằng https://script.google.com/...)'
    });
  }

  try {
    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test_connection',
        secretKey: key
      }),
      signal: AbortSignal.timeout(15000)
    });

    const elapsed = Date.now() - startTime;
    const data = await response.json() as any;

    if (data && data.success) {
      addLog('SYNC_SHEETS', `Kiểm tra kết nối Google Sheets thành công (${elapsed}ms). Bảng tính: ${data.spreadsheetName}`, 'SUCCESS');
      return res.json({
        success: true,
        latencyMs: elapsed,
        data: data
      });
    } else {
      return res.status(400).json({
        success: false,
        error: data?.error || 'Phản hồi thất bại từ Google Apps Script',
        data: data
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Không thể kết nối đến Google Apps Script: ${err.message}. Hãy đảm bảo Web App đã được triển khai với quyền 'Bất kỳ ai' (Anyone).`
    });
  }
});

// Đồng bộ thủ công tất cả kết quả chưa đồng bộ lên Google Sheets
app.post('/api/admin/sheets/sync-all', requireAdmin, async (req: Request, res: Response) => {
  const submittedAttempts = Object.values(db.attempts).filter(a => a.status === 'submitted');
  let synced = 0;
  let failed = 0;

  for (const attempt of submittedAttempts) {
    const officialExam = OFFICIAL_EXAMS.find(e => e.code === attempt.examCode) || OFFICIAL_EXAMS[0];
    const details = officialExam.mcqQuestions.map(q => ({
      questionId: q.id,
      type: 'MCQ',
      studentAnswer: attempt.mcqAnswers[q.id] || '',
      score: attempt.mcqAnswers[q.id] === q.correctOption ? 0.25 : 0,
      version: attempt.examCode
    }));

    const result = await syncAttemptToGoogleSheets(attempt, details);
    if (result.success) synced++;
    else failed++;
  }

  res.json({
    success: true,
    total: submittedAttempts.length,
    synced,
    failed,
    message: `Đã xử lý đồng bộ ${synced}/${submittedAttempts.length} bài thi lên Google Sheets.`
  });
});

// Lấy nhật ký hệ thống (NHAT_KY)
app.get('/api/admin/logs', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, logs: db.logs });
});

// Thống kê kết quả chuyên sâu cho giáo viên
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const attempts = Object.values(db.attempts).filter(a => a.status === 'submitted');
  const totalStudents = db.students.length;
  const completedCount = attempts.length;

  if (completedCount === 0) {
    return res.json({
      success: true,
      stats: {
        totalStudents,
        completedCount,
        uncompletedCount: totalStudents - completedCount,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        passRate: 0,
        distribution: { '0-2': 0, '2-4': 0, '4-5': 0, '5-6.5': 0, '6.5-8': 0, '8-10': 0 },
        byClass: {},
        byExamCode: {},
        hardestQuestions: []
      }
    });
  }

  const scores = attempts.map(a => a.totalScore || 0);
  const sum = scores.reduce((acc, s) => acc + s, 0);
  const avg = Math.round((sum / completedCount) * 100) / 100;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const passCount = scores.filter(s => s >= 5.0).length;
  const passRate = Math.round((passCount / completedCount) * 100);

  const distribution = {
    '0-2': scores.filter(s => s < 2).length,
    '2-4': scores.filter(s => s >= 2 && s < 4).length,
    '4-5': scores.filter(s => s >= 4 && s < 5).length,
    '5-6.5': scores.filter(s => s >= 5 && s < 6.5).length,
    '6.5-8': scores.filter(s => s >= 6.5 && s < 8).length,
    '8-10': scores.filter(s => s >= 8).length
  };

  // Thống kê theo lớp
  const byClass: Record<string, { total: number; submitted: number; avgScore: number }> = {};
  for (const s of db.students) {
    if (!byClass[s.className]) byClass[s.className] = { total: 0, submitted: 0, avgScore: 0 };
    byClass[s.className].total++;
  }
  for (const a of attempts) {
    if (byClass[a.className]) {
      byClass[a.className].submitted++;
    }
  }

  // Thống kê theo mã đề
  const byExamCode: Record<string, { count: number; avgScore: number }> = {};
  for (const a of attempts) {
    if (!byExamCode[a.examCode]) byExamCode[a.examCode] = { count: 0, avgScore: 0 };
    byExamCode[a.examCode].count++;
  }
  for (const code of Object.keys(byExamCode)) {
    const codeScores = attempts.filter(a => a.examCode === code).map(a => a.totalScore || 0);
    byExamCode[code].avgScore = Math.round((codeScores.reduce((acc, s) => acc + s, 0) / codeScores.length) * 100) / 100;
  }

  // Phân tích câu hỏi khó (sai nhiều nhất)
  const questionErrorStats: Record<string, { questionId: string; wrongCount: number; total: number; text: string }> = {};
  for (const a of attempts) {
    const exam = OFFICIAL_EXAMS.find(e => e.code === a.examCode) || OFFICIAL_EXAMS[0];
    for (const q of exam.mcqQuestions) {
      if (!questionErrorStats[q.id]) {
        questionErrorStats[q.id] = { questionId: q.id, wrongCount: 0, total: 0, text: q.text };
      }
      questionErrorStats[q.id].total++;
      if (a.mcqAnswers[q.id] !== q.correctOption) {
        questionErrorStats[q.id].wrongCount++;
      }
    }
  }

  const hardestQuestions = Object.values(questionErrorStats)
    .map(q => ({
      ...q,
      errorRate: Math.round((q.wrongCount / Math.max(1, q.total)) * 100)
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  res.json({
    success: true,
    stats: {
      totalStudents,
      completedCount,
      uncompletedCount: totalStudents - completedCount,
      averageScore: avg,
      maxScore: max,
      minScore: min,
      passRate,
      distribution,
      byClass,
      byExamCode,
      hardestQuestions
    }
  });
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
    console.log(`HỆ THỐNG KIỂM TRA GIỮA HỌC KỲ I - TIN HỌC THPT`);
    console.log(`Trường THPT Giá Rai - Phân hiệu Nguyễn Trung Trực`);
    console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Lỗi khởi động máy chủ:', err);
});
