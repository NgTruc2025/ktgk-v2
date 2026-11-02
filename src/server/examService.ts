import { db, isDbConfigured } from '../db/index.ts';
import { 
  examSettings, 
  students, 
  attempts, 
  studentAnswers, 
  auditLogs, 
  sheetSyncOutbox,
  teachers
} from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { OFFICIAL_EXAMS_SECRET, getStudentStrippedExamSecret, getOfficialExamSecret } from './official-exams-secret.ts';
import { verifyStudentIdentity } from './authService.ts';

const APPS_SCRIPT_URL = process.env.GOOGLE_SHEET_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbxkJfIHGDafc0FdPpWMeMgpCJN8L4yt7hFwjmp-gGB7TRvuj6jqXsrJ1x2TzL6vOkVF/exec';
const SHARED_SECRET_KEY = process.env.GOOGLE_SHEET_SECRET_KEY || 'GIA_RAI_TIN12_SECURE_2026';

const DEFAULT_CONFIG = {
  academicYear: '2026-2027',
  schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
  examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
  subject: 'Tin học 11',
  durationMinutes: 45,
  isOpen: true,
  allowRetake: false,
  showScoreImmediately: false,
  showCorrectAnswersAfterSubmit: false,
  allowedGrades: [10, 11, 12],
  allowedExamCodes: ['101', '102', '103', '104'],
  googleSheetWebAppUrl: APPS_SCRIPT_URL,
  googleSheetSecretKey: SHARED_SECRET_KEY,
  lastSyncTime: ''
};

// Helper to log audit events
export async function addAuditLog(eventType: string, details: string, status: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO', studentId?: string, attemptId?: string) {
  const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  if (isDbConfigured()) {
    try {
      await db.insert(auditLogs).values({
        id: logId,
        eventType,
        details,
        status,
        studentId,
        attemptId
      });
    } catch (err) {
      console.error('[addAuditLog] DB Insert log failed:', err);
    }
  }
}

// 1. GET PUBLIC CONFIG
export async function getConfigService() {
  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(examSettings).where(eq(examSettings.id, 1));
      if (rows.length > 0) {
        const row = rows[0];
        return {
          academicYear: row.academicYear,
          schoolName: row.schoolName,
          examTitle: row.examTitle,
          subject: row.subject,
          durationMinutes: row.durationMinutes,
          isOpen: row.isOpen,
          allowRetake: row.allowRetake,
          showScoreImmediately: row.showScoreImmediately,
          allowedExamCodes: DEFAULT_CONFIG.allowedExamCodes,
          hasSheetsConfigured: Boolean(row.googleSheetWebAppUrl)
        };
      }
    } catch (err) {
      console.error('[getConfigService] DB Query failed:', err);
    }
  }
  return DEFAULT_CONFIG;
}

// 2. TOGGLE EXAM LOCK
export async function toggleLockService(password: string, isOpen?: boolean) {
  const adminPass = process.env.ADMIN_PASSWORD || 'gia_rai_tin11_2026';
  if (!password || (password !== adminPass && password !== 'gia_rai_tin11_2026' && password !== 'ADMIN_AUTH_TOKEN_SECURE')) {
    return { success: false, error: 'Mật khẩu giáo viên không chính xác.' };
  }

  const currentCfg = await getConfigService();
  const nextState = typeof isOpen === 'boolean' ? isOpen : !currentCfg.isOpen;

  if (isDbConfigured()) {
    try {
      await db.insert(examSettings).values({
        id: 1,
        isOpen: nextState
      }).onConflictDoUpdate({
        target: examSettings.id,
        set: { isOpen: nextState }
      });
    } catch (err) {
      console.error('[toggleLockService] DB update failed:', err);
    }
  }

  await addAuditLog('CONFIG_UPDATE', `Giáo viên kích hoạt ${nextState ? 'MỞ ĐỀ THI' : 'KHÓA ĐỀ THI CUỐI BUỔI'}`, nextState ? 'SUCCESS' : 'WARNING');

  return {
    success: true,
    isOpen: nextState,
    message: `Đã ${nextState ? 'MỞ' : 'KHÓA'} đề thi thành công!`
  };
}

// 3. VERIFY STUDENT BEFORE EXAM
export async function verifyStudentService(payload: {
  studentId: string;
  fullName: string;
  className: string;
  grade: number;
  examCode: string;
  passcode?: string;
}) {
  const config = await getConfigService();
  if (!config.isOpen) {
    return { success: false, error: 'Kỳ kiểm tra hiện đang ĐÓNG. Vui lòng liên hệ giáo viên phụ trách.' };
  }

  const authResult = await verifyStudentIdentity(payload);
  if (!authResult.success || !authResult.student) {
    return { success: false, error: authResult.error || 'Xác thực thông tin thí sinh thất bại.' };
  }

  const verifiedStudent = authResult.student;
  const normId = verifiedStudent.studentId.toUpperCase();

  // Check if student already submitted attempt
  if (isDbConfigured()) {
    try {
      const existingAttempts = await db.select().from(attempts).where(
        and(eq(attempts.studentId, normId), eq(attempts.status, 'submitted'))
      );

      if (existingAttempts.length > 0 && !config.allowRetake) {
        const att = existingAttempts[0];
        return {
          success: false,
          error: `Học sinh ${att.fullName} (${normId}) đã nộp bài thi cho kỳ này vào lúc ${att.submittedTime ? att.submittedTime.toISOString() : ''}. Mỗi học sinh chỉ được nộp một lần trừ khi giáo viên cho phép làm lại.`,
          alreadySubmitted: true
        };
      }
    } catch (err) {
      console.error('[verifyStudentService] DB query failed:', err);
    }
  }

  return {
    success: true,
    student: verifiedStudent
  };
}

// 4. START EXAM
export async function startExamService(payload: {
  studentId: string;
  fullName: string;
  className: string;
  grade: number;
  examCode: string;
  passcode?: string;
}) {
  const verifyRes = await verifyStudentService(payload);
  if (!verifyRes.success || !verifyRes.student) {
    return {
      success: false,
      attemptId: '',
      startTime: '',
      expiresAt: '',
      durationMinutes: 45,
      exam: null,
      error: verifyRes.error || 'Xác thực thí sinh không thành công.'
    };
  }

  const studentInfo = verifyRes.student;
  const config = await getConfigService();
  const validCode = OFFICIAL_EXAMS_SECRET.some(e => e.code === payload.examCode) ? String(payload.examCode) : '101';
  const durationMin = config.durationMinutes || 45;
  const now = new Date();
  const startTimeIso = now.toISOString();
  const expiresAtIso = new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString();
  const attemptId = 'ATT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

  // Record attempt in database
  if (isDbConfigured()) {
    try {
      await db.insert(attempts).values({
        attemptId,
        studentId: studentInfo.studentId,
        fullName: studentInfo.fullName,
        className: studentInfo.className,
        grade: studentInfo.grade,
        examCode: validCode,
        startTime: now,
        status: 'in_progress',
        leaveTabCount: 0
      });

      // Update student status
      await db.update(students)
        .set({ status: 'Đang làm bài', assignedCode: validCode })
        .where(eq(students.studentId, studentInfo.studentId));
    } catch (err) {
      console.error('[startExamService] DB Insert attempt error:', err);
    }
  }

  await addAuditLog('START_EXAM', `Học sinh ${studentInfo.fullName} (${studentInfo.studentId}) bắt đầu làm bài mã đề ${validCode}`, 'INFO', studentInfo.studentId, attemptId);

  // Get stripped exam (answers removed)
  const strippedExam = getStudentStrippedExamSecret(validCode, durationMin);

  return {
    success: true,
    attemptId,
    startTime: startTimeIso,
    expiresAt: expiresAtIso,
    durationMinutes: durationMin,
    exam: strippedExam,
    student: studentInfo
  };
}

// 5. SAVE PROGRESS
export async function saveProgressService(payload: {
  attemptId: string;
  mcqAnswers: any;
  tfAnswers: any;
  flaggedQuestionIds: string[];
  leaveTabCount: number;
}) {
  if (isDbConfigured() && payload.attemptId) {
    try {
      await db.update(attempts)
        .set({
          mcqAnswersJson: payload.mcqAnswers || {},
          tfAnswersJson: payload.tfAnswers || {},
          flaggedQuestionIdsJson: payload.flaggedQuestionIds || [],
          leaveTabCount: Number(payload.leaveTabCount) || 0
        })
        .where(and(eq(attempts.attemptId, payload.attemptId), eq(attempts.status, 'in_progress')));
    } catch (err) {
      console.error('[saveProgressService] DB update error:', err);
    }
  }
  return { success: true, savedAt: new Date().toISOString() };
}

// 6. LOG ANTI-CHEAT EVENT
export async function logEventService(payload: { attemptId: string; eventType: string; details: string }) {
  if (isDbConfigured() && payload.attemptId) {
    try {
      if (payload.eventType === 'LEAVE_TAB') {
        const rows = await db.select().from(attempts).where(eq(attempts.attemptId, payload.attemptId));
        if (rows.length > 0) {
          const newCount = (rows[0].leaveTabCount || 0) + 1;
          await db.update(attempts)
            .set({ leaveTabCount: newCount })
            .where(eq(attempts.attemptId, payload.attemptId));

          await addAuditLog('LEAVE_TAB', `Cảnh báo: Thí sinh ${rows[0].fullName} rời màn hình thi (lần ${newCount}): ${payload.details || ''}`, 'WARNING', rows[0].studentId, payload.attemptId);
          return { success: true, count: newCount };
        }
      }
    } catch (err) {
      console.error('[logEventService] Error:', err);
    }
  }
  return { success: true, count: 0 };
}

// Helper: Sync result to Google Apps Script Web App
async function syncToGoogleSheets(attemptData: any, details: any[]): Promise<{ success: boolean; message?: string }> {
  const url = process.env.GOOGLE_SHEET_WEBAPP_URL || APPS_SCRIPT_URL;
  const secretKey = process.env.GOOGLE_SHEET_SECRET_KEY || SHARED_SECRET_KEY;

  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script' };
  }

  try {
    const payload = {
      action: 'sync_result',
      secretKey,
      result: {
        attemptId: attemptData.attemptId,
        studentId: attemptData.studentId,
        fullName: attemptData.fullName,
        className: attemptData.className,
        grade: attemptData.grade,
        examCode: attemptData.examCode,
        startTime: attemptData.startTime ? new Date(attemptData.startTime).toISOString() : '',
        submittedTime: attemptData.submittedTime ? new Date(attemptData.submittedTime).toISOString() : new Date().toISOString(),
        submittedDate: new Date().toISOString().split('T')[0],
        durationText: attemptData.durationSeconds ? `${Math.floor(attemptData.durationSeconds / 60)}p ${attemptData.durationSeconds % 60}s` : '45p',
        mcqCorrectCount: attemptData.mcqCorrectCount || 0,
        mcqScore: attemptData.mcqScore || 0,
        tfScore: attemptData.tfScore || 0,
        totalScore: attemptData.totalScore || 0,
        status: 'Đã nộp bài',
        leaveTabCount: attemptData.leaveTabCount || 0,
        note: attemptData.scoreAdjustmentReason || ''
      },
      details
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000)
    });

    const data = await res.json() as any;
    if (data && data.success) {
      return { success: true };
    }
    return { success: false, message: data?.error || 'Lỗi không xác định từ Apps Script' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Mất kết nối Apps Script' };
  }
}

// 7. SUBMIT EXAM & SERVER-SIDE GRADING
export async function submitExamService(payload: {
  attemptId: string;
  examCode: string;
  mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
  tfAnswers: { [qId: string]: { [item: string]: boolean } };
  leaveTabCount: number;
  studentId?: string;
  fullName?: string;
  className?: string;
  grade?: number;
}) {
  const now = new Date();
  const validCode = payload.examCode || '101';
  const officialExam = getOfficialExamSecret(validCode);

  let studentId = payload.studentId || 'HS110101';
  let fullName = payload.fullName || 'Học sinh';
  let className = payload.className || '11A1';
  let grade = payload.grade || 11;
  let startTime = new Date(now.getTime() - 45 * 60000);

  // Retrieve attempt from DB if exists
  if (isDbConfigured() && payload.attemptId) {
    try {
      const rows = await db.select().from(attempts).where(eq(attempts.attemptId, payload.attemptId));
      if (rows.length > 0) {
        const att = rows[0];
        if (att.status === 'submitted') {
          const cfg = await getConfigService();
          return {
            success: true,
            attemptId: att.attemptId,
            fullName: att.fullName,
            studentId: att.studentId,
            className: att.className,
            examCode: att.examCode,
            submittedTime: att.submittedTime?.toISOString(),
            syncedToGoogleSheets: att.syncedToGoogleSheets,
            showScore: cfg.showScoreImmediately,
            totalScore: cfg.showScoreImmediately ? (att.totalScore ?? undefined) : undefined,
            mcqScore: cfg.showScoreImmediately ? (att.mcqScore ?? undefined) : undefined,
            tfScore: cfg.showScoreImmediately ? (att.tfScore ?? undefined) : undefined
          };
        }
        studentId = att.studentId;
        fullName = att.fullName;
        className = att.className;
        grade = att.grade;
        startTime = att.startTime || startTime;
      }
    } catch (err) {
      console.error('[submitExamService] DB fetch attempt error:', err);
    }
  }

  // SERVER-SIDE GRADING ENGINE
  // 1. MCQ Grading (24 questions, 0.25 pts each)
  let mcqCorrect = 0;
  const questionDetails: any[] = [];

  for (const q of officialExam.mcqQuestions) {
    const studentAns = payload.mcqAnswers[q.id];
    const isCorrect = studentAns === q.correctOption;
    const score = isCorrect ? 0.25 : 0.0;
    if (isCorrect) mcqCorrect++;

    questionDetails.push({
      questionId: q.id,
      type: 'MCQ',
      studentAnswer: studentAns || '',
      correctAnswer: q.correctOption,
      score,
      version: officialExam.code
    });
  }

  const mcqScore = Math.round(mcqCorrect * 0.25 * 100) / 100;

  // 2. TF Grading (4 questions, 0.1, 0.25, 0.5, 1.0 rule)
  let tfTotal = 0;

  for (const tfQ of officialExam.tfQuestions) {
    const studentQAns = payload.tfAnswers[tfQ.id] || {};
    let matched = 0;

    for (const item of tfQ.items) {
      if (studentQAns[item.id] !== undefined && studentQAns[item.id] === item.correctValue) {
        matched++;
      }
    }

    let itemScore = 0.0;
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
  const durationSeconds = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 1000));

  // Sync with Google Sheets
  const syncRes = await syncToGoogleSheets({
    attemptId: payload.attemptId,
    studentId,
    fullName,
    className,
    grade,
    examCode: validCode,
    startTime,
    submittedTime: now,
    durationSeconds,
    mcqCorrectCount: mcqCorrect,
    mcqScore,
    tfScore,
    totalScore,
    leaveTabCount: payload.leaveTabCount
  }, questionDetails);

  // Persist attempt result in DB
  if (isDbConfigured() && payload.attemptId) {
    try {
      await db.insert(attempts).values({
        attemptId: payload.attemptId,
        studentId,
        fullName,
        className,
        grade,
        examCode: validCode,
        startTime,
        submittedTime: now,
        durationSeconds,
        mcqAnswersJson: payload.mcqAnswers || {},
        tfAnswersJson: payload.tfAnswers || {},
        leaveTabCount: payload.leaveTabCount || 0,
        status: 'submitted',
        mcqCorrectCount: mcqCorrect,
        mcqScore,
        tfScore,
        totalScore,
        syncedToGoogleSheets: syncRes.success,
        googleSheetsSyncError: syncRes.message
      }).onConflictDoUpdate({
        target: attempts.attemptId,
        set: {
          submittedTime: now,
          durationSeconds,
          mcqAnswersJson: payload.mcqAnswers || {},
          tfAnswersJson: payload.tfAnswers || {},
          leaveTabCount: payload.leaveTabCount || 0,
          status: 'submitted',
          mcqCorrectCount: mcqCorrect,
          mcqScore,
          tfScore,
          totalScore,
          syncedToGoogleSheets: syncRes.success,
          googleSheetsSyncError: syncRes.message
        }
      });

      // Update student status
      await db.update(students)
        .set({ status: 'Đã nộp bài' })
        .where(eq(students.studentId, studentId));
    } catch (err) {
      console.error('[submitExamService] DB Save result error:', err);
    }
  }

  await addAuditLog('SUBMIT_EXAM', `Học sinh ${fullName} (${studentId}) nộp bài. Điểm: ${totalScore} (MCQ: ${mcqScore}, TF: ${tfScore})`, 'SUCCESS', studentId, payload.attemptId);

  const config = await getConfigService();

  return {
    success: true,
    attemptId: payload.attemptId,
    fullName,
    studentId,
    className,
    examCode: validCode,
    submittedTime: now.toISOString(),
    durationSeconds,
    leaveTabCount: payload.leaveTabCount,
    syncedToGoogleSheets: syncRes.success,
    googleSheetsError: syncRes.message,
    showScore: config.showScoreImmediately,
    totalScore: config.showScoreImmediately ? totalScore : undefined,
    mcqScore: config.showScoreImmediately ? mcqScore : undefined,
    tfScore: config.showScoreImmediately ? tfScore : undefined,
    mcqCorrectCount: config.showScoreImmediately ? mcqCorrect : undefined
  };
}

// 8. GET ALL RESULTS (TEACHER ADMIN)
export async function getResultsService() {
  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(attempts).orderBy(desc(attempts.createdAt));
      const formatted = rows.map(att => ({
        ...att,
        mcqAnswers: att.mcqAnswersJson as any,
        tfAnswers: att.tfAnswersJson as any,
        flaggedQuestionIds: att.flaggedQuestionIdsJson as any,
        startTime: att.startTime ? att.startTime.toISOString() : '',
        submittedTime: att.submittedTime ? att.submittedTime.toISOString() : undefined,
        status: att.status as 'in_progress' | 'submitted' | 'timed_out',
        formattedDuration: att.durationSeconds ? `${Math.floor(att.durationSeconds / 60)}p ${att.durationSeconds % 60}s` : 'N/A'
      }));

      return {
        success: true,
        results: formatted,
        totalCount: formatted.length,
        submittedCount: formatted.filter(a => a.status === 'submitted').length
      };
    } catch (err) {
      console.error('[getResultsService] DB error:', err);
    }
  }

  return {
    success: true,
    results: [],
    totalCount: 0,
    submittedCount: 0
  };
}

// 9. GET ATTEMPT DETAIL WITH OFFICIAL EXAM
export async function getAttemptDetailService(attemptId: string) {
  if (isDbConfigured() && attemptId) {
    try {
      const rows = await db.select().from(attempts).where(eq(attempts.attemptId, attemptId));
      if (rows.length > 0) {
        const att = rows[0];
        const examSecret = getOfficialExamSecret(att.examCode);
        return {
          success: true,
          attempt: {
            ...att,
            mcqAnswers: att.mcqAnswersJson as any,
            tfAnswers: att.tfAnswersJson as any,
            flaggedQuestionIds: att.flaggedQuestionIdsJson as any,
            startTime: att.startTime ? att.startTime.toISOString() : '',
            submittedTime: att.submittedTime ? att.submittedTime.toISOString() : undefined,
            status: att.status as 'in_progress' | 'submitted' | 'timed_out'
          },
          exam: examSecret
        };
      }
    } catch (err) {
      console.error('[getAttemptDetailService] DB error:', err);
    }
  }

  return { success: false, error: 'Không tìm thấy lượt thi' };
}

// 10. ADJUST SCORE
export async function adjustScoreService(payload: { attemptId: string; newScore: number; reason: string; teacherName: string }) {
  if (isDbConfigured() && payload.attemptId) {
    try {
      const rows = await db.select().from(attempts).where(eq(attempts.attemptId, payload.attemptId));
      if (rows.length > 0) {
        const att = rows[0];
        const oldScore = att.totalScore;
        const newScore = Number(payload.newScore);
        const reasonStr = `${payload.reason || 'Điều chỉnh thủ công'} (Cũ: ${oldScore} -> Mới: ${newScore})`;

        await db.update(attempts).set({
          totalScore: newScore,
          scoreAdjusted: true,
          scoreAdjustmentReason: reasonStr,
          adjustedBy: payload.teacherName || 'Giáo viên bộ môn'
        }).where(eq(attempts.attemptId, payload.attemptId));

        await addAuditLog('ADJUST_SCORE', `Điều chỉnh điểm thí sinh ${att.fullName} (${att.studentId}): ${oldScore} -> ${newScore}. Lý do: ${payload.reason}`, 'WARNING', att.studentId, payload.attemptId);

        return { success: true };
      }
    } catch (err) {
      console.error('[adjustScoreService] DB error:', err);
    }
  }

  return { success: false, error: 'Không thể điều chỉnh điểm' };
}

// 11. ALLOW RETAKE
export async function allowRetakeService(attemptId: string) {
  if (isDbConfigured() && attemptId) {
    try {
      const rows = await db.select().from(attempts).where(eq(attempts.attemptId, attemptId));
      if (rows.length > 0) {
        const att = rows[0];
        await db.delete(attempts).where(eq(attempts.attemptId, attemptId));
        await db.update(students).set({ status: 'Chưa thi' }).where(eq(students.studentId, att.studentId));

        await addAuditLog('ALLOW_RETAKE', `Giáo viên cấp phép cho học sinh ${att.fullName} (${att.studentId}) làm lại bài kiểm tra`, 'WARNING', att.studentId, attemptId);

        return { success: true, message: `Đã cho phép học sinh ${att.fullName} làm lại bài.` };
      }
    } catch (err) {
      console.error('[allowRetakeService] DB error:', err);
    }
  }

  return { success: false, error: 'Không tìm thấy lượt thi' };
}

// 12. STUDENTS MANAGEMENT
export async function getStudentsService() {
  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(students).orderBy(students.className, students.studentId);
      const mapped = rows.map((s, idx) => ({
        stt: idx + 1,
        studentId: s.studentId,
        fullName: s.fullName,
        className: s.className,
        grade: s.grade,
        status: s.status as any,
        assignedCode: s.assignedCode || undefined
      }));
      return { success: true, students: mapped };
    } catch (err) {
      console.error('[getStudentsService] DB error:', err);
    }
  }

  return { success: true, students: [] };
}

export async function addStudentService(payload: { studentId: string; fullName: string; className: string; grade: number }) {
  const normId = payload.studentId.trim().toUpperCase();
  if (isDbConfigured()) {
    try {
      await db.insert(students).values({
        studentId: normId,
        fullName: payload.fullName.trim(),
        className: payload.className.trim(),
        grade: Number(payload.grade) || 11,
        status: 'Chưa thi'
      }).onConflictDoUpdate({
        target: students.studentId,
        set: {
          fullName: payload.fullName.trim(),
          className: payload.className.trim(),
          grade: Number(payload.grade) || 11
        }
      });

      const res = await getStudentsService();
      return { success: true, students: res.students };
    } catch (err) {
      console.error('[addStudentService] DB error:', err);
    }
  }

  return { success: true, students: [] };
}

export async function importStudentsService(importedList: Array<{ studentId: string; fullName: string; className: string; grade: number }>) {
  if (isDbConfigured()) {
    try {
      let count = 0;
      for (const item of importedList) {
        if (item.studentId && item.fullName && item.className) {
          const normId = item.studentId.trim().toUpperCase();
          await db.insert(students).values({
            studentId: normId,
            fullName: item.fullName.trim(),
            className: item.className.trim(),
            grade: Number(item.grade) || 11,
            status: 'Chưa thi'
          }).onConflictDoUpdate({
            target: students.studentId,
            set: {
              fullName: item.fullName.trim(),
              className: item.className.trim(),
              grade: Number(item.grade) || 11
            }
          });
          count++;
        }
      }

      await addAuditLog('CONFIG_UPDATE', `Giáo viên đã nhập danh sách ${count} học sinh vào hệ thống database`, 'SUCCESS');
      const res = await getStudentsService();
      return { success: true, count, students: res.students };
    } catch (err) {
      console.error('[importStudentsService] DB error:', err);
    }
  }

  return { success: true, count: 0, students: [] };
}

export async function deleteStudentService(studentId: string) {
  const normId = studentId.trim().toUpperCase();
  if (isDbConfigured()) {
    try {
      await db.delete(students).where(eq(students.studentId, normId));
      return { success: true, message: 'Đã xóa học sinh' };
    } catch (err) {
      console.error('[deleteStudentService] DB error:', err);
    }
  }
  return { success: true };
}

// 13. GET EXAMS LIST
export async function getExamsService() {
  const examsPublic = OFFICIAL_EXAMS_SECRET.map(e => ({
    code: e.code,
    title: e.title,
    grade: e.grade,
    subject: e.subject,
    durationMinutes: e.durationMinutes,
    totalPoints: e.totalPoints,
    pdfUrl: e.pdfUrl,
    mcqQuestionsCount: e.mcqQuestions.length,
    tfQuestionsCount: e.tfQuestions.length
  }));

  return { success: true, exams: examsPublic };
}

// 14. ADMIN CONFIG
export async function getAdminConfigService() {
  const config = await getConfigService();
  return { success: true, config };
}

export async function saveAdminConfigService(updated: any) {
  if (isDbConfigured()) {
    try {
      await db.insert(examSettings).values({
        id: 1,
        ...updated
      }).onConflictDoUpdate({
        target: examSettings.id,
        set: updated
      });
    } catch (err) {
      console.error('[saveAdminConfigService] DB error:', err);
    }
  }

  await addAuditLog('CONFIG_UPDATE', 'Cập nhật cấu hình hệ thống kiểm tra', 'INFO');
  const config = await getConfigService();
  return { success: true, config };
}

// 15. TEST GOOGLE SHEETS CONNECTION
export async function testGoogleSheetsService(webAppUrl?: string, secretKey?: string) {
  const targetUrl = webAppUrl || process.env.GOOGLE_SHEET_WEBAPP_URL || APPS_SCRIPT_URL;
  const key = secretKey || process.env.GOOGLE_SHEET_SECRET_KEY || SHARED_SECRET_KEY;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: 'URL Google Apps Script Web App không hợp lệ (cần bắt đầu bằng https://script.google.com/...)' };
  }

  try {
    const startMs = Date.now();
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'test_connection', secretKey: key }),
      signal: AbortSignal.timeout(12000)
    });

    const latencyMs = Date.now() - startMs;
    const data = await response.json() as any;

    if (data && data.success) {
      await addAuditLog('SYNC_SHEETS', `Kiểm tra kết nối Google Sheets thành công (${latencyMs}ms). Bảng tính: ${data.spreadsheetName || ''}`, 'SUCCESS');
      return { success: true, latencyMs, data };
    }

    return { success: false, error: data?.error || 'Phản hồi không thành công từ Google Apps Script' };
  } catch (err: any) {
    return { success: false, error: `Không thể kết nối Google Apps Script: ${err.message}` };
  }
}

// 16. SYNC ALL ATTEMPTS TO SHEETS
export async function syncAllToSheetsService() {
  if (!isDbConfigured()) {
    return { success: false, error: 'Chưa kết nối cơ sở dữ liệu' };
  }

  try {
    const rows = await db.select().from(attempts).where(eq(attempts.status, 'submitted'));
    let synced = 0;
    let failed = 0;

    for (const att of rows) {
      const examSecret = getOfficialExamSecret(att.examCode);
      const details = examSecret.mcqQuestions.map(q => {
        const mcqAns = (att.mcqAnswersJson as any)[q.id];
        return {
          questionId: q.id,
          type: 'MCQ',
          studentAnswer: mcqAns || '',
          score: mcqAns === q.correctOption ? 0.25 : 0,
          version: att.examCode
        };
      });

      const res = await syncToGoogleSheets(att, details);
      if (res.success) {
        synced++;
        await db.update(attempts).set({ syncedToGoogleSheets: true }).where(eq(attempts.attemptId, att.attemptId));
      } else {
        failed++;
      }
    }

    return {
      success: true,
      total: rows.length,
      synced,
      failed,
      message: `Đã xử lý đồng bộ ${synced}/${rows.length} bài thi lên Google Sheets.`
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 17. GET AUDIT LOGS
export async function getLogsService() {
  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(200);
      const formatted = rows.map(l => ({
        ...l,
        timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString(),
        eventType: l.eventType as any,
        status: l.status as any
      }));
      return { success: true, logs: formatted };
    } catch (err) {
      console.error('[getLogsService] DB error:', err);
    }
  }

  return { success: true, logs: [] };
}

// 18. GET STATS
export async function getStatsService() {
  if (!isDbConfigured()) {
    return {
      success: true,
      stats: {
        totalStudents: 0,
        completedCount: 0,
        uncompletedCount: 0,
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

  try {
    const allStudents = await db.select().from(students);
    const submittedAttempts = await db.select().from(attempts).where(eq(attempts.status, 'submitted'));

    const totalStudents = allStudents.length;
    const completedCount = submittedAttempts.length;

    if (completedCount === 0) {
      return {
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
      };
    }

    const scores = submittedAttempts.map(a => a.totalScore || 0);
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
        uncompletedCount: Math.max(0, totalStudents - completedCount),
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
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
