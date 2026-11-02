import { 
  ExamConfig, 
  ExamAttempt, 
  Student, 
  AuditLogEntry, 
  ExamVersion, 
  MCQQuestion, 
  TFQuestion 
} from '../types/exam';
import { OFFICIAL_EXAMS } from '../data/official-exams';
import { INITIAL_STUDENTS } from '../data/initial-students';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkJfIHGDafc0FdPpWMeMgpCJN8L4yt7hFwjmp-gGB7TRvuj6jqXsrJ1x2TzL6vOkVF/exec';
const SHARED_SECRET_KEY = 'GIA_RAI_TIN12_SECURE_2026';
const ADMIN_PASSWORD = 'admin123';

// Local storage keys for standalone Vercel / Client mode
const STORAGE_CONFIG = 'gvr_exam_config_v2';
const STORAGE_STUDENTS = 'gvr_exam_students_v1';
const STORAGE_ATTEMPTS = 'gvr_exam_attempts_v1';
const STORAGE_LOGS = 'gvr_exam_logs_v1';

const DEFAULT_CONFIG: ExamConfig = {
  academicYear: '2026-2027',
  schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
  examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
  subject: 'Tin học 11',
  durationMinutes: 45,
  isOpen: false,
  allowRetake: false,
  showScoreImmediately: false,
  showCorrectAnswersAfterSubmit: false,
  allowedGrades: [10, 11, 12],
  allowedExamCodes: ['101', '102', '103', '104'],
  googleSheetWebAppUrl: APPS_SCRIPT_URL,
  googleSheetSecretKey: SHARED_SECRET_KEY,
  lastSyncTime: ''
};

// Helpers for localStorage
function getLocalConfig(): ExamConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CONFIG;
}

function saveLocalConfig(cfg: ExamConfig) {
  try {
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(cfg));
  } catch {}
}

function getLocalStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_STUDENTS];
}

function saveLocalStudents(st: Student[]) {
  try {
    localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(st));
  } catch {}
}

function getLocalAttempts(): Record<string, ExamAttempt> {
  try {
    const raw = localStorage.getItem(STORAGE_ATTEMPTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveLocalAttempts(att: Record<string, ExamAttempt>) {
  try {
    localStorage.setItem(STORAGE_ATTEMPTS, JSON.stringify(att));
  } catch {}
}

function getLocalLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function addLocalLog(eventType: AuditLogEntry['eventType'], details: string, status: AuditLogEntry['status'] = 'INFO', studentId?: string, attemptId?: string) {
  const logs = getLocalLogs();
  logs.unshift({
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    eventType,
    details,
    status,
    studentId,
    attemptId
  });
  if (logs.length > 500) logs.pop();
  try {
    localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs));
  } catch {}
}

// Strip answers for student payload
function getStudentStrippedExam(code: string, durationMinutes = 45) {
  const exam = OFFICIAL_EXAMS.find(e => e.code === code) || OFFICIAL_EXAMS[0];
  return {
    code: exam.code,
    title: exam.title,
    grade: exam.grade,
    subject: exam.subject,
    durationMinutes,
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

// Direct Sync to Google Apps Script
async function sendToGoogleAppsScript(payload: any) {
  const cfg = getLocalConfig();
  const url = cfg.googleSheetWebAppUrl || APPS_SCRIPT_URL;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// Proactive backend availability detection
// When hosted on static platforms (e.g. Vercel SPA build without node, GitHub Pages),
// /api/* returns 404, 405 Method Not Allowed, or rewrites to /index.html (HTML text).
// We check once cleanly without throwing errors to prevent noisy browser console 405/HTML parse errors.
let backendStatus: 'unknown' | 'available' | 'unavailable' = 'unknown';

async function isBackendAvailable(): Promise<boolean> {
  if (backendStatus !== 'unknown') {
    return backendStatus === 'available';
  }

  try {
    const res = await fetch('/api/config', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });
    const cType = res.headers.get('content-type') || '';
    if (res.ok && cType.includes('application/json')) {
      const text = await res.text();
      if (!text.trim().startsWith('<')) {
        const data = JSON.parse(text);
        if (data && (data.schoolName || data.academicYear || data.allowedExamCodes)) {
          backendStatus = 'available';
          return true;
        }
      }
    }
  } catch {
    // Network or parse failure
  }

  backendStatus = 'unavailable';
  return false;
}

/**
 * Universal API Adapter:
 * Tries server endpoint first IF backend is active. If in standalone / Vercel static mode,
 * seamlessly executes the client-side engine and syncs directly with Google Apps Script.
 */
export const apiClient = {
  // 1. Get Exam Config
  async getConfig(): Promise<ExamConfig> {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/config', {
          headers: { 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            const serverConfig = JSON.parse(text);
            if (typeof serverConfig.isOpen === 'boolean') {
              const local = getLocalConfig();
              local.isOpen = serverConfig.isOpen;
              saveLocalConfig(local);
            }
            return { ...getLocalConfig(), ...serverConfig };
          }
        }
      } catch {}
    }
    return getLocalConfig();
  },

  // 1b. Toggle Exam Lock with teacher password
  async toggleExamLock(password: string, isOpen?: boolean): Promise<{ success: boolean; isOpen: boolean; message?: string; error?: string }> {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/exam/toggle-lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ password, isOpen })
        });

        const contentType = res.headers.get('content-type') || '';
        let data: any = null;
        if (contentType.includes('application/json')) {
          try {
            data = await res.json();
          } catch {}
        }

        if (res.ok && data && typeof data.isOpen === 'boolean') {
          const local = getLocalConfig();
          local.isOpen = data.isOpen;
          saveLocalConfig(local);
          return {
            success: true,
            isOpen: data.isOpen,
            message: typeof data.message === 'string' ? data.message : `Đã ${data.isOpen ? 'MỞ' : 'KHÓA'} đề thi thành công!`
          };
        }

        if (res.status === 401) {
          let errText = 'Mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.';
          if (data) {
            if (typeof data.error === 'string') errText = data.error;
            else if (data.error && typeof data.error.message === 'string') errText = data.error.message;
            else if (typeof data.message === 'string') errText = data.message;
          }
          return { success: false, isOpen: getLocalConfig().isOpen, error: errText };
        }

        // If 404 or other server failure, do NOT return a raw error object; fall through to client fallback engine below
      } catch {
        // Network failure, proceed to fallback client engine below
      }
    }

    // Client fallback verification
    if (password !== ADMIN_PASSWORD && password !== 'admin123') {
      return { success: false, isOpen: getLocalConfig().isOpen, error: 'Mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.' };
    }
    const local = getLocalConfig();
    local.isOpen = typeof isOpen === 'boolean' ? isOpen : !local.isOpen;
    saveLocalConfig(local);
    addLocalLog('CONFIG_UPDATE', `Giáo viên kích hoạt ${local.isOpen ? 'MỞ' : 'KHÓA'} đề thi`, 'INFO');
    return {
      success: true,
      isOpen: local.isOpen,
      message: `Đã ${local.isOpen ? 'MỞ' : 'KHÓA'} đề thi thành công!`
    };
  },
  async verifyStudent(payload: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  }): Promise<{ success: boolean; student?: Student; error?: string }> {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/students/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const cType = res.headers.get('content-type') || '';
          if (cType.includes('application/json')) {
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const data = JSON.parse(text);
              if (data && typeof data.success === 'boolean') {
                return data;
              }
            }
          }
        } else if (res.status === 403 || res.status === 400) {
          try {
            const errData = await res.json();
            const errStr = typeof errData?.error === 'string'
              ? errData.error
              : (errData?.error && typeof errData.error.message === 'string')
                ? errData.error.message
                : (typeof errData?.message === 'string')
                  ? errData.message
                  : 'Yêu cầu không hợp lệ';
            return { success: false, error: errStr };
          } catch {}
        } else if (res.status === 404 || res.status === 405) {
          backendStatus = 'unavailable';
        }
      } catch {}
    }

    // Fallback Client Engine
    const cfg = getLocalConfig();
    if (!cfg.isOpen) {
      return { success: false, error: 'Kỳ kiểm tra hiện đang ĐÓNG. Vui lòng liên hệ giáo viên phụ trách.' };
    }

    const normId = payload.studentId.trim().toUpperCase();
    const attempts = getLocalAttempts();
    const existingAttempt = Object.values(attempts).find(
      a => a.studentId.toUpperCase() === normId && a.status === 'submitted'
    );

    if (existingAttempt && !cfg.allowRetake) {
      return {
        success: false,
        error: `Học sinh ${existingAttempt.fullName} (${payload.studentId}) đã nộp bài thi cho kỳ này vào lúc ${existingAttempt.submittedTime}. Mỗi học sinh chỉ được nộp một lần trừ khi giáo viên cho phép làm lại.`
      };
    }

    const students = getLocalStudents();
    const matched = students.find(s => s.studentId.toUpperCase() === normId);

    return {
      success: true,
      student: matched || {
        studentId: normId,
        fullName: payload.fullName.trim(),
        className: payload.className.trim(),
        grade: payload.grade || 12,
        status: 'Chưa thi'
      }
    };
  },

  // 3. Start Exam Session
  async startExam(payload: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  }): Promise<{
    success: boolean;
    attemptId: string;
    startTime: string;
    expiresAt: string;
    durationMinutes: number;
    exam: any;
    error?: string;
  }> {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/exam/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const cType = res.headers.get('content-type') || '';
          if (cType.includes('application/json')) {
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const data = JSON.parse(text);
              if (data && data.success && data.exam) {
                return data;
              }
            }
          }
        } else if (res.status === 403) {
          try {
            const errData = await res.json();
            if (errData && errData.error) return errData;
          } catch {}
          return {
            success: false,
            attemptId: '',
            startTime: '',
            expiresAt: '',
            durationMinutes: 45,
            exam: null,
            error: 'Kỳ kiểm tra hiện đang ĐÓNG. Vui lòng liên hệ giáo viên phụ trách.'
          };
        } else if (res.status === 404 || res.status === 405 || res.status >= 500) {
          // Server returned an error, seamlessly execute fallback engine
          backendStatus = 'unavailable';
        }
      } catch {
        backendStatus = 'unavailable';
      }
    }

    // Fallback Client Engine (Immediate, offline-resilient)
    const cfg = getLocalConfig();
    const durationMin = cfg.durationMinutes || 45;
    const now = new Date();
    const startTime = now.toISOString();
    const expiresAt = new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString();
    const attemptId = 'ATT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const attempt: ExamAttempt = {
      attemptId,
      studentId: payload.studentId.trim().toUpperCase(),
      fullName: payload.fullName.trim(),
      className: payload.className.trim(),
      grade: Number(payload.grade) || 12,
      examCode: payload.examCode,
      startTime,
      mcqAnswers: {},
      tfAnswers: {},
      flaggedQuestionIds: [],
      leaveTabCount: 0,
      status: 'in_progress'
    };

    const attempts = getLocalAttempts();
    attempts[attemptId] = attempt;
    saveLocalAttempts(attempts);

    const students = getLocalStudents();
    const s = students.find(item => item.studentId.toUpperCase() === attempt.studentId);
    if (s) {
      s.status = 'Đang làm bài';
      s.assignedCode = payload.examCode;
      saveLocalStudents(students);
    }

    addLocalLog('START_EXAM', `Học sinh ${payload.fullName} (${payload.studentId}) bắt đầu làm bài mã đề ${payload.examCode}`, 'INFO', payload.studentId, attemptId);

    return {
      success: true,
      attemptId,
      startTime,
      expiresAt,
      durationMinutes: durationMin,
      exam: getStudentStrippedExam(payload.examCode, durationMin)
    };
  },

  // 4. Save Progress (Auto-save)
  async saveProgress(payload: {
    attemptId: string;
    mcqAnswers: any;
    tfAnswers: any;
    flaggedQuestionIds: string[];
    leaveTabCount: number;
  }) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        await fetch('/api/exam/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {}
    }

    const attempts = getLocalAttempts();
    const att = attempts[payload.attemptId];
    if (att && att.status !== 'submitted') {
      if (payload.mcqAnswers) att.mcqAnswers = payload.mcqAnswers;
      if (payload.tfAnswers) att.tfAnswers = payload.tfAnswers;
      if (payload.flaggedQuestionIds) att.flaggedQuestionIds = payload.flaggedQuestionIds;
      if (typeof payload.leaveTabCount === 'number') att.leaveTabCount = payload.leaveTabCount;
      saveLocalAttempts(attempts);
    }
    return { success: true };
  },

  // 5. Log Anti-Cheat Event
  async logEvent(payload: { attemptId: string; eventType: string; details: string }) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        await fetch('/api/exam/log-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {}
    }

    const attempts = getLocalAttempts();
    const att = attempts[payload.attemptId];
    if (att) {
      att.leaveTabCount = (att.leaveTabCount || 0) + 1;
      saveLocalAttempts(attempts);
      addLocalLog('LEAVE_TAB', `Cảnh báo: ${att.fullName} rời màn hình thi (lần ${att.leaveTabCount}): ${payload.details}`, 'WARNING', att.studentId, payload.attemptId);
    }
  },

  // 6. Submit Exam & Grade
  async submitExam(payload: {
    attemptId: string;
    examCode: string;
    mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
    tfAnswers: { [qId: string]: { [item: string]: boolean } };
    leaveTabCount: number;
  }) {
    // Try server first if backend is active
    const localAttempts = getLocalAttempts();
    const localAttempt = localAttempts[payload.attemptId];
    const serverPayload = {
      ...payload,
      studentId: localAttempt?.studentId,
      fullName: localAttempt?.fullName,
      className: localAttempt?.className,
      grade: localAttempt?.grade
    };

    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/exam/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(serverPayload)
        });
        if (res.ok) {
          const cType = res.headers.get('content-type') || '';
          if (cType.includes('application/json')) {
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const data = JSON.parse(text);
              if (data && data.success) {
                return data;
              }
            }
          }
        } else if (res.status === 404 || res.status === 405 || res.status >= 500) {
          backendStatus = 'unavailable';
        }
      } catch {
        backendStatus = 'unavailable';
      }
    }

    // Fallback Client Grading & Direct Google Sheets Sync
    const attempts = getLocalAttempts();
    const attempt = attempts[payload.attemptId] || {
      attemptId: payload.attemptId,
      studentId: 'HS110101',
      fullName: 'Học sinh',
      className: '11A1',
      grade: 11,
      examCode: payload.examCode,
      startTime: new Date(Date.now() - 45 * 60000).toISOString(),
      mcqAnswers: payload.mcqAnswers,
      tfAnswers: payload.tfAnswers,
      flaggedQuestionIds: [],
      leaveTabCount: payload.leaveTabCount || 0,
      status: 'in_progress'
    };

    const now = new Date();
    attempt.submittedTime = now.toISOString();
    attempt.mcqAnswers = payload.mcqAnswers;
    attempt.tfAnswers = payload.tfAnswers;
    attempt.leaveTabCount = payload.leaveTabCount;

    const startMs = new Date(attempt.startTime).getTime();
    attempt.durationSeconds = Math.max(1, Math.round((now.getTime() - startMs) / 1000));

    // Grading logic
    const officialExam = OFFICIAL_EXAMS.find(e => e.code === payload.examCode) || OFFICIAL_EXAMS[0];

    // MCQ
    let mcqCorrect = 0;
    const questionDetails: any[] = [];
    for (const q of officialExam.mcqQuestions) {
      const ans = payload.mcqAnswers[q.id];
      const isCorrect = ans === q.correctOption;
      if (isCorrect) mcqCorrect++;
      questionDetails.push({
        questionId: q.id,
        type: 'MCQ',
        studentAnswer: ans || '',
        correctAnswer: q.correctOption,
        score: isCorrect ? 0.25 : 0,
        version: officialExam.code
      });
    }
    const mcqScore = Math.round(mcqCorrect * 0.25 * 100) / 100;

    // TF
    let tfTotal = 0;
    for (const tfQ of officialExam.tfQuestions) {
      const studentQAns = payload.tfAnswers[tfQ.id] || {};
      let matched = 0;
      for (const item of tfQ.items) {
        if (studentQAns[item.id] !== undefined && studentQAns[item.id] === item.correctValue) {
          matched++;
        }
      }
      let itemScore = 0;
      if (matched === 1) itemScore = 0.1;
      else if (matched === 2) itemScore = 0.25;
      else if (matched === 3) itemScore = 0.5;
      else if (matched === 4) itemScore = 1.0;
      tfTotal += itemScore;

      questionDetails.push({
        questionId: tfQ.id,
        type: 'TF',
        studentAnswer: studentQAns,
        matchedItemsCount: matched,
        score: itemScore,
        version: officialExam.code
      });
    }
    const tfScore = Math.round(tfTotal * 100) / 100;
    const totalScore = Math.round((mcqScore + tfScore) * 100) / 100;

    attempt.mcqCorrectCount = mcqCorrect;
    attempt.mcqScore = mcqScore;
    attempt.tfScore = tfScore;
    attempt.totalScore = totalScore;
    attempt.status = 'submitted';

    // Direct Google Sheets sync
    let syncSuccess = false;
    let syncError: string | undefined;
    try {
      const sheetRes = await sendToGoogleAppsScript({
        action: 'sync_result',
        secretKey: SHARED_SECRET_KEY,
        result: {
          attemptId: attempt.attemptId,
          studentId: attempt.studentId,
          fullName: attempt.fullName,
          className: attempt.className,
          grade: attempt.grade,
          examCode: attempt.examCode,
          startTime: attempt.startTime,
          submittedTime: attempt.submittedTime,
          submittedDate: attempt.submittedTime.split('T')[0],
          durationText: `${Math.floor(attempt.durationSeconds / 60)}p ${attempt.durationSeconds % 60}s`,
          mcqCorrectCount: mcqCorrect,
          mcqScore: mcqScore,
          tfScore: tfScore,
          totalScore: totalScore,
          status: 'Đã nộp bài',
          leaveTabCount: attempt.leaveTabCount,
          note: ''
        },
        details: questionDetails
      });

      if (sheetRes && sheetRes.success) {
        syncSuccess = true;
        attempt.syncedToGoogleSheets = true;
        attempt.googleSheetsRow = sheetRes.rowNumber;
      } else {
        syncError = sheetRes?.error;
      }
    } catch (e: any) {
      syncError = e.message;
    }

    attempts[attempt.attemptId] = attempt;
    saveLocalAttempts(attempts);

    const students = getLocalStudents();
    const st = students.find(s => s.studentId.toUpperCase() === attempt.studentId);
    if (st) {
      st.status = 'Đã nộp bài';
      saveLocalStudents(students);
    }

    addLocalLog('SUBMIT_EXAM', `Học sinh ${attempt.fullName} nộp bài. Điểm: ${totalScore} (MCQ: ${mcqScore}, TF: ${tfScore})`, 'SUCCESS', attempt.studentId, attempt.attemptId);

    const cfg = getLocalConfig();
    return {
      success: true,
      attemptId: attempt.attemptId,
      fullName: attempt.fullName,
      studentId: attempt.studentId,
      className: attempt.className,
      examCode: attempt.examCode,
      submittedTime: attempt.submittedTime,
      durationSeconds: attempt.durationSeconds,
      leaveTabCount: attempt.leaveTabCount,
      syncedToGoogleSheets: syncSuccess,
      googleSheetsError: syncError,
      showScore: cfg.showScoreImmediately,
      totalScore: cfg.showScoreImmediately ? totalScore : undefined,
      mcqScore: cfg.showScoreImmediately ? mcqScore : undefined,
      tfScore: cfg.showScoreImmediately ? tfScore : undefined,
      mcqCorrectCount: cfg.showScoreImmediately ? mcqCorrect : undefined
    };
  },

  // 7. Teacher Login
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ password })
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    if (password === ADMIN_PASSWORD || password === 'admin123') {
      addLocalLog('CONFIG_UPDATE', 'Giáo viên đăng nhập vào hệ thống', 'INFO');
      return { success: true, token: 'ADMIN_AUTH_TOKEN_SECURE' };
    }
    return { success: false, error: 'Mật khẩu giáo viên không chính xác.' };
  },

  // 8. Admin Results
  async getResults() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/results', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const atts = Object.values(getLocalAttempts()).map(att => ({
      ...att,
      formattedDuration: att.durationSeconds ? `${Math.floor(att.durationSeconds / 60)}p ${att.durationSeconds % 60}s` : 'N/A'
    }));

    return {
      success: true,
      results: atts,
      totalCount: atts.length,
      submittedCount: atts.filter(a => a.status === 'submitted').length
    };
  },

  // 9. Get Single Attempt Detail
  async getAttemptDetail(attemptId: string) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch(`/api/admin/attempt/${attemptId}`, {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const atts = getLocalAttempts();
    const attempt = atts[attemptId];
    if (!attempt) return { success: false, error: 'Không tìm thấy bài làm' };
    const exam = OFFICIAL_EXAMS.find(e => e.code === attempt.examCode) || OFFICIAL_EXAMS[0];
    return { success: true, attempt, exam };
  },

  // 10. Adjust Score
  async adjustScore(payload: { attemptId: string; newScore: number; reason: string; teacherName: string }) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/results/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const atts = getLocalAttempts();
    const att = atts[payload.attemptId];
    if (att) {
      const oldScore = att.totalScore;
      att.totalScore = Number(payload.newScore);
      att.scoreAdjusted = true;
      att.scoreAdjustmentReason = `${payload.reason} (Cũ: ${oldScore} -> Mới: ${payload.newScore})`;
      saveLocalAttempts(atts);
      addLocalLog('ADJUST_SCORE', `Điều chỉnh điểm thí sinh ${att.fullName}: ${oldScore} -> ${payload.newScore}. Lý do: ${payload.reason}`, 'WARNING', att.studentId, payload.attemptId);
    }
    return { success: true };
  },

  // 11. Allow Retake
  async allowRetake(attemptId: string) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/results/allow-retake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' },
          body: JSON.stringify({ attemptId })
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const atts = getLocalAttempts();
    const att = atts[attemptId];
    if (att) {
      const sId = att.studentId;
      delete atts[attemptId];
      saveLocalAttempts(atts);

      const students = getLocalStudents();
      const st = students.find(s => s.studentId === sId);
      if (st) {
        st.status = 'Chưa thi';
        saveLocalStudents(students);
      }
    }
    return { success: true };
  },

  // 12. Students management
  async getStudents() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/students', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }
    return { success: true, students: getLocalStudents() };
  },

  async addStudent(payload: { studentId: string; fullName: string; className: string; grade: number }) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const students = getLocalStudents();
    const normId = payload.studentId.trim().toUpperCase();
    const idx = students.findIndex(s => s.studentId.toUpperCase() === normId);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...payload, studentId: normId };
    } else {
      students.push({
        stt: students.length + 1,
        studentId: normId,
        fullName: payload.fullName.trim(),
        className: payload.className.trim(),
        grade: payload.grade || 12,
        status: 'Chưa thi'
      });
    }
    saveLocalStudents(students);
    return { success: true, students };
  },

  async importStudents(importedList: Array<{ studentId: string; fullName: string; className: string; grade: number }>) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/students/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' },
          body: JSON.stringify({ students: importedList })
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const students = getLocalStudents();
    for (const item of importedList) {
      const normId = item.studentId.trim().toUpperCase();
      const existing = students.findIndex(s => s.studentId.toUpperCase() === normId);
      if (existing >= 0) {
        students[existing] = { ...students[existing], ...item, studentId: normId };
      } else {
        students.push({
          stt: students.length + 1,
          studentId: normId,
          fullName: item.fullName.trim(),
          className: item.className.trim(),
          grade: item.grade || 12,
          status: 'Chưa thi'
        });
      }
    }
    saveLocalStudents(students);
    return { success: true, count: importedList.length, students };
  },

  async deleteStudent(studentId: string) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch(`/api/admin/students/${studentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const students = getLocalStudents().filter(s => s.studentId.toUpperCase() !== studentId.trim().toUpperCase());
    saveLocalStudents(students);
    return { success: true };
  },

  // 13. Exams
  async getExams() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/exams', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }
    return { success: true, exams: OFFICIAL_EXAMS };
  },

  // 14. Admin Config
  async getAdminConfig() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/config', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }
    return { success: true, config: getLocalConfig() };
  },

  async saveAdminConfig(updated: Partial<ExamConfig>) {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' },
          body: JSON.stringify(updated)
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const current = getLocalConfig();
    const merged = { ...current, ...updated };
    saveLocalConfig(merged);
    return { success: true, config: merged };
  },

  // 15. Google Sheets Test Connection
  async testGoogleSheets(targetUrl?: string, key?: string) {
    const url = targetUrl || getLocalConfig().googleSheetWebAppUrl || APPS_SCRIPT_URL;
    const secretKey = key || SHARED_SECRET_KEY;

    try {
      const startMs = Date.now();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'test_connection', secretKey })
      });
      const data = await res.json();
      const latencyMs = Date.now() - startMs;
      return { success: Boolean(data?.success), latencyMs, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể kết nối Google Apps Script' };
    }
  },

  // 16. Sync All to Sheets
  async syncAllToSheets() {
    const attempts = Object.values(getLocalAttempts()).filter(a => a.status === 'submitted');
    let synced = 0;
    let failed = 0;

    for (const att of attempts) {
      try {
        const exam = OFFICIAL_EXAMS.find(e => e.code === att.examCode) || OFFICIAL_EXAMS[0];
        const details = exam.mcqQuestions.map(q => ({
          questionId: q.id,
          type: 'MCQ',
          studentAnswer: att.mcqAnswers[q.id] || '',
          score: att.mcqAnswers[q.id] === q.correctOption ? 0.25 : 0,
          version: att.examCode
        }));

        const res = await sendToGoogleAppsScript({
          action: 'sync_result',
          secretKey: SHARED_SECRET_KEY,
          result: {
            attemptId: att.attemptId,
            studentId: att.studentId,
            fullName: att.fullName,
            className: att.className,
            grade: att.grade,
            examCode: att.examCode,
            startTime: att.startTime,
            submittedTime: att.submittedTime,
            submittedDate: att.submittedTime ? att.submittedTime.split('T')[0] : '',
            durationText: att.durationSeconds ? `${Math.floor(att.durationSeconds / 60)}p ${att.durationSeconds % 60}s` : '',
            mcqCorrectCount: att.mcqCorrectCount ?? 0,
            mcqScore: att.mcqScore ?? 0,
            tfScore: att.tfScore ?? 0,
            totalScore: att.totalScore ?? 0,
            status: 'Đã nộp bài',
            leaveTabCount: att.leaveTabCount ?? 0,
            note: ''
          },
          details
        });

        if (res && res.success) {
          synced++;
          att.syncedToGoogleSheets = true;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    saveLocalAttempts(getLocalAttempts());
    return {
      success: true,
      total: attempts.length,
      synced,
      failed,
      message: `Đã xử lý đồng bộ ${synced}/${attempts.length} bài thi lên Google Sheets.`
    };
  },

  // 17. Logs
  async getLogs() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/logs', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }
    return { success: true, logs: getLocalLogs() };
  },

  // 18. Stats
  async getStats() {
    const hasBackend = await isBackendAvailable();
    if (hasBackend) {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': 'Bearer ADMIN_AUTH_TOKEN_SECURE', 'Accept': 'application/json' }
        });
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const text = await res.text();
          if (!text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
        }
      } catch {}
    }

    const students = getLocalStudents();
    const attempts = Object.values(getLocalAttempts()).filter(a => a.status === 'submitted');
    const totalStudents = students.length;
    const completedCount = attempts.length;

    if (completedCount === 0) {
      return {
        success: true,
        stats: {
          totalStudents,
          completedCount,
          uncompletedCount: totalStudents,
          averageScore: 0,
          maxScore: 0,
          minScore: 0,
          passRate: 0,
          distribution: { '0-2': 0, '2-4': 0, '4-5': 0, '5-6.5': 0, '6.5-8': 0, '8-10': 0 },
          byClass: {},
          byExamCode: {},
          hardestQuestions: []
        }
      };
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

    return {
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
        byClass: {},
        byExamCode: {},
        hardestQuestions: []
      }
    };
  }
};
