import { OFFICIAL_EXAMS } from '../../src/data/official-exams';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0dFXgLfry-NYdAX91ZswzY-ktnYV5CSOlQl6J2ADndZicFx2aJCUo_q7xWXSVUePY/exec';
const SHARED_SECRET_KEY = 'GIA_RAI_TIN12_SECURE_2026';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Exam submit endpoint is ready' });
  }

  const body = req.body || {};
  const {
    attemptId,
    examCode = '101',
    mcqAnswers = {},
    tfAnswers = {},
    leaveTabCount = 0,
    studentId = 'HS110101',
    fullName = 'Học sinh',
    className = '11A1',
    grade = 11
  } = body;

  const officialExam = OFFICIAL_EXAMS.find(e => e.code === examCode) || OFFICIAL_EXAMS[0];

  // 1. Chấm MCQ
  let mcqCorrect = 0;
  const questionDetails: any[] = [];
  for (const q of officialExam.mcqQuestions) {
    const studentAns = mcqAnswers[q.id];
    const isCorrect = studentAns === q.correctOption;
    if (isCorrect) mcqCorrect++;
    questionDetails.push({
      questionId: q.id,
      type: 'MCQ',
      studentAnswer: studentAns || '',
      correctAnswer: q.correctOption,
      score: isCorrect ? 0.25 : 0,
      version: officialExam.code
    });
  }
  const mcqScore = Math.round(mcqCorrect * 0.25 * 100) / 100;

  // 2. Chấm TF
  let tfTotal = 0;
  for (const tfQ of officialExam.tfQuestions) {
    const studentQAns = tfAnswers[tfQ.id] || {};
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
  const submittedTime = new Date().toISOString();

  // Đồng bộ Google Apps Script
  let synced = false;
  let syncError: string | undefined;

  try {
    const sheetRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'sync_result',
        secretKey: SHARED_SECRET_KEY,
        result: {
          attemptId: attemptId || `ATT_${Date.now()}`,
          studentId,
          fullName,
          className,
          grade: Number(grade) || 12,
          examCode,
          submittedTime,
          submittedDate: submittedTime.split('T')[0],
          durationText: '45 phút',
          mcqCorrectCount: mcqCorrect,
          mcqScore,
          tfScore,
          totalScore,
          status: 'Đã nộp bài',
          leaveTabCount,
          note: ''
        },
        details: questionDetails
      }),
      signal: AbortSignal.timeout(10000)
    });

    const sheetData = await sheetRes.json() as any;
    if (sheetData && sheetData.success) {
      synced = true;
    } else {
      syncError = sheetData?.error;
    }
  } catch (err: any) {
    syncError = err.message;
  }

  // Ẩn điểm học sinh theo yêu cầu: showScoreImmediately = false
  const showScoreImmediately = false;

  return res.status(200).json({
    success: true,
    attemptId,
    fullName,
    studentId,
    className,
    examCode,
    submittedTime,
    durationSeconds: 2700,
    leaveTabCount,
    syncedToGoogleSheets: synced,
    googleSheetsError: syncError,
    showScore: showScoreImmediately,
    totalScore: showScoreImmediately ? totalScore : undefined,
    mcqScore: showScoreImmediately ? mcqScore : undefined,
    tfScore: showScoreImmediately ? tfScore : undefined,
    mcqCorrectCount: showScoreImmediately ? mcqCorrect : undefined
  });
}
