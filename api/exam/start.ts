import { OFFICIAL_EXAMS } from '../../src/data/official-exams';
import { MCQQuestion, TFQuestion } from '../../src/types/exam';

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

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, message: 'Exam start endpoint is ready' });
  }

  try {
    const body = req.body || {};
    const { studentId = '', fullName = '', className = '', grade = 12, examCode = '101' } = body;

    const validCode = (Array.isArray(OFFICIAL_EXAMS) && OFFICIAL_EXAMS.some(e => e.code === examCode)) ? examCode : '101';
    const durationMin = 45;
    const now = new Date();
    const startTime = now.toISOString();
    const expiresAt = new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString();
    const attemptId = 'ATT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const strippedExam = getStudentStrippedExam(validCode, durationMin);

    return res.status(200).json({
      success: true,
      attemptId,
      startTime,
      expiresAt,
      durationMinutes: durationMin,
      exam: strippedExam,
      student: {
        studentId: String(studentId).trim().toUpperCase(),
        fullName: String(fullName).trim(),
        className: String(className).trim(),
        grade: Number(grade) || 12,
        examCode: validCode
      }
    });
  } catch (err: any) {
    const durationMin = 45;
    const now = new Date();
    return res.status(200).json({
      success: true,
      attemptId: 'ATT_' + Date.now() + '_SAFE',
      startTime: now.toISOString(),
      expiresAt: new Date(now.getTime() + durationMin * 60 * 1000 + 45 * 1000).toISOString(),
      durationMinutes: durationMin,
      exam: getStudentStrippedExam('101', durationMin)
    });
  }
}
