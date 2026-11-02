export type QuestionType = 'MCQ' | 'TF';

export interface MCQQuestion {
  id: string; // e.g. "C1", "C2"
  number: number; // 1 to 24
  text: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctOption?: 'A' | 'B' | 'C' | 'D'; // Server-only, stripped for student
  topic?: string;
  points: number; // 0.25
}

export interface TFSubItem {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  correctValue?: boolean; // Server-only, stripped for student
}

export interface TFQuestion {
  id: string; // e.g. "TF1", "TF2"
  number: number; // 1 to 4 (display as 25 to 28 or Part II Q1 to Q4)
  context: string;
  items: TFSubItem[];
  pointsBreakdown: { [count: number]: number }; // {1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0}
  topic?: string;
}

export interface ExamVersion {
  code: string; // "101", "102", "103", "104"
  title: string;
  grade: number; // 11
  subject: string; // "Tin học"
  durationMinutes: number; // 45
  totalPoints: number; // 10.0
  pdfUrl?: string;
  mcqQuestions: MCQQuestion[];
  tfQuestions: TFQuestion[];
}

export interface Student {
  stt?: number;
  studentId: string; // "HS1101", "11A1_01"
  fullName: string;
  className: string; // "11A1", "11A2", etc.
  grade: number; // 10, 11, 12
  status: 'Chưa thi' | 'Đang làm bài' | 'Đã nộp bài';
  assignedCode?: string;
}

export interface StudentAnswerMCQ {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export interface StudentAnswerTF {
  questionId: string;
  answers: {
    a: boolean | null;
    b: boolean | null;
    c: boolean | null;
    d: boolean | null;
  };
}

export interface ExamAttempt {
  attemptId: string;
  studentId: string;
  fullName: string;
  className: string;
  grade: number;
  examCode: string;
  startTime: string; // ISO string
  submittedTime?: string;
  durationSeconds?: number;
  mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
  tfAnswers: { [qId: string]: { [item: string]: boolean } };
  flaggedQuestionIds: string[];
  leaveTabCount: number;
  status: 'in_progress' | 'submitted' | 'timed_out';
  
  // Results calculated strictly by backend
  mcqCorrectCount?: number;
  mcqScore?: number;
  tfScore?: number;
  totalScore?: number;
  scoreAdjusted?: boolean;
  scoreAdjustmentReason?: string;
  adjustedBy?: string;
  syncedToGoogleSheets?: boolean;
  googleSheetsSyncError?: string;
  googleSheetsRow?: number;
}

export interface ExamConfig {
  academicYear: string; // "2026-2027"
  schoolName: string; // "Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực"
  examTitle: string; // "KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027"
  subject: string; // "Tin học 12"
  durationMinutes: number; // 45
  isOpen: boolean;
  allowRetake: boolean;
  showScoreImmediately: boolean;
  showCorrectAnswersAfterSubmit: boolean;
  allowedGrades: number[];
  allowedExamCodes: string[];
  googleSheetWebAppUrl?: string;
  googleSheetSecretKey?: string;
  lastSyncTime?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  studentId?: string;
  attemptId?: string;
  eventType: 'START_EXAM' | 'SUBMIT_EXAM' | 'LEAVE_TAB' | 'SYNC_SHEETS' | 'ADJUST_SCORE' | 'CONFIG_UPDATE' | 'ALLOW_RETAKE';
  details: string;
  status: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}
