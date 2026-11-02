import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  let isOpen = true;
  let academicYear = '2026-2027';
  let schoolName = 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực';
  let examTitle = 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027';
  let subject = 'Tin học 11';
  let durationMinutes = 45;
  let allowRetake = false;
  let showScoreImmediately = false;
  let allowedGrades = [10, 11, 12];
  let allowedExamCodes = ['101', '102', '103', '104'];
  let hasSheetsConfigured = true;

  try {
    const dbPath = path.join(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(raw);
      if (db && db.config) {
        if (typeof db.config.isOpen === 'boolean') isOpen = db.config.isOpen;
        if (db.config.academicYear) academicYear = db.config.academicYear;
        if (db.config.schoolName) schoolName = db.config.schoolName;
        if (db.config.examTitle) examTitle = db.config.examTitle;
        if (db.config.subject) subject = db.config.subject;
        if (db.config.durationMinutes) durationMinutes = db.config.durationMinutes;
        if (typeof db.config.allowRetake === 'boolean') allowRetake = db.config.allowRetake;
        if (typeof db.config.showScoreImmediately === 'boolean') showScoreImmediately = db.config.showScoreImmediately;
        if (Array.isArray(db.config.allowedGrades)) allowedGrades = db.config.allowedGrades;
        if (Array.isArray(db.config.allowedExamCodes)) allowedExamCodes = db.config.allowedExamCodes;
        hasSheetsConfigured = Boolean(db.config.googleSheetWebAppUrl);
      }
    }
  } catch (err) {
    console.warn('[api/config] Error reading server-db.json:', err);
  }

  return res.status(200).json({
    academicYear,
    schoolName,
    examTitle,
    subject,
    durationMinutes,
    isOpen,
    allowRetake,
    showScoreImmediately,
    showCorrectAnswersAfterSubmit: false,
    allowedGrades,
    allowedExamCodes,
    hasSheetsConfigured
  });
}
