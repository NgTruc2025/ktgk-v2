import { pgTable, text, integer, boolean, timestamp, doublePrecision, jsonb, primaryKey, index, serial } from 'drizzle-orm/pg-core';

// 1. TEACHERS TABLE
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('teacher'), // 'teacher' | 'admin'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. STUDENTS TABLE
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull().unique(), // e.g. "HS110101"
  fullName: text('full_name').notNull(),
  className: text('class_name').notNull(), // e.g. "11A1"
  grade: integer('grade').notNull().default(11),
  passcodeHash: text('passcode_hash'), // Hashed exam passcode if provided by teacher
  status: text('status').notNull().default('Chưa thi'), // 'Chưa thi' | 'Đang làm bài' | 'Đã nộp bài'
  assignedCode: text('assigned_code'), // Optional pre-assigned exam code (101, 102, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_students_class').on(table.className),
  index('idx_students_student_id').on(table.studentId)
]);

// 3. EXAMS TABLE
export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // "101", "102", "103", "104"
  title: text('title').notNull(),
  grade: integer('grade').notNull().default(11),
  subject: text('subject').notNull().default('Tin học'),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  totalPoints: doublePrecision('total_points').notNull().default(10.0),
  pdfUrl: text('pdf_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. EXAM QUESTIONS TABLE (SERVER-ONLY OFFICIAL ANSWERS)
export const examQuestions = pgTable('exam_questions', {
  id: text('id').primaryKey(), // e.g. "101_MCQ_1", "101_TF_1"
  examCode: text('exam_code').notNull().references(() => exams.code, { onDelete: 'cascade' }),
  questionType: text('question_type').notNull(), // 'MCQ' | 'TF'
  questionNumber: integer('question_number').notNull(),
  context: text('context').notNull(), // Text for MCQ or scenario for TF
  topic: text('topic'),
  optionsJson: jsonb('options_json'), // For MCQ: [{key: 'A', text: '...'}, ...]
  itemsJson: jsonb('items_json'), // For TF: [{id: 'a', text: '...'}, ...]
  correctAnswerJson: jsonb('correct_answer_json').notNull(), // For MCQ: 'C' | For TF: {a: true, b: false, c: false, d: true}
  points: doublePrecision('points').notNull().default(0.25),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_questions_exam_code').on(table.examCode)
]);

// 5. ATTEMPTS TABLE
export const attempts = pgTable('attempts', {
  attemptId: text('attempt_id').primaryKey(), // "ATT_..."
  studentId: text('student_id').notNull().references(() => students.studentId, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  className: text('class_name').notNull(),
  grade: integer('grade').notNull().default(11),
  examCode: text('exam_code').notNull().references(() => exams.code),
  startTime: timestamp('start_time').notNull().defaultNow(),
  submittedTime: timestamp('submitted_time'),
  durationSeconds: integer('duration_seconds'),
  mcqAnswersJson: jsonb('mcq_answers_json').notNull().default({}),
  tfAnswersJson: jsonb('tf_answers_json').notNull().default({}),
  flaggedQuestionIdsJson: jsonb('flagged_question_ids_json').notNull().default([]),
  leaveTabCount: integer('leave_tab_count').notNull().default(0),
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'submitted' | 'timed_out'
  mcqCorrectCount: integer('mcq_correct_count'),
  mcqScore: doublePrecision('mcq_score'),
  tfScore: doublePrecision('tf_score'),
  totalScore: doublePrecision('total_score'),
  scoreAdjusted: boolean('score_adjusted').notNull().default(false),
  scoreAdjustmentReason: text('score_adjustment_reason'),
  adjustedBy: text('adjusted_by'),
  syncedToGoogleSheets: boolean('synced_to_google_sheets').notNull().default(false),
  googleSheetsSyncError: text('google_sheets_sync_error'),
  googleSheetsRow: integer('google_sheets_row'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_attempts_student_id').on(table.studentId),
  index('idx_attempts_status').on(table.status),
  index('idx_attempts_exam_code').on(table.examCode)
]);

// 6. STUDENT ANSWERS ITEMIZED TABLE
export const studentAnswers = pgTable('student_answers', {
  id: serial('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => attempts.attemptId, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => examQuestions.id),
  questionType: text('question_type').notNull(), // 'MCQ' | 'TF'
  studentAnswerJson: jsonb('student_answer_json'), // 'A' | {a: true, b: false}
  isCorrect: boolean('is_correct'),
  score: doublePrecision('score').notNull().default(0.0),
  answeredAt: timestamp('answered_at').defaultNow().notNull()
}, (table) => [
  index('idx_student_answers_attempt_id').on(table.attemptId)
]);

// 7. AUDIT LOGS TABLE
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  studentId: text('student_id'),
  attemptId: text('attempt_id'),
  eventType: text('event_type').notNull(), // 'START_EXAM' | 'SUBMIT_EXAM' | 'LEAVE_TAB' | 'SYNC_SHEETS' | 'ADJUST_SCORE' | 'CONFIG_UPDATE' | 'ALLOW_RETAKE' | 'TEACHER_LOGIN'
  details: text('details').notNull(),
  status: text('status').notNull().default('INFO') // 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
});

// 8. EXAM SETTINGS TABLE
export const examSettings = pgTable('exam_settings', {
  id: integer('id').primaryKey().default(1), // Singleton config row id=1
  academicYear: text('academic_year').notNull().default('2026-2027'),
  schoolName: text('school_name').notNull().default('Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực'),
  examTitle: text('exam_title').notNull().default('KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027'),
  subject: text('subject').notNull().default('Tin học 11'),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  isOpen: boolean('is_open').notNull().default(true),
  allowRetake: boolean('allow_retake').notNull().default(false),
  showScoreImmediately: boolean('show_score_immediately').notNull().default(false),
  showCorrectAnswersAfterSubmit: boolean('show_correct_answers_after_submit').notNull().default(false),
  googleSheetWebAppUrl: text('google_sheet_webapp_url'),
  googleSheetSecretKey: text('google_sheet_secret_key'),
  lastSyncTime: timestamp('last_sync_time')
});

// 9. SESSIONS TABLE
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // Session token / Cookie ID
  userType: text('user_type').notNull(), // 'teacher' | 'student'
  userId: text('user_id').notNull(), // email for teacher, student_id for student
  emailOrStudentId: text('email_or_student_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('idx_sessions_user_id').on(table.userId),
  index('idx_sessions_expires_at').on(table.expiresAt)
]);

// 10. SHEET SYNC OUTBOX TABLE
export const sheetSyncOutbox = pgTable('sheet_sync_outbox', {
  id: serial('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => attempts.attemptId, { onDelete: 'cascade' }),
  payloadJson: jsonb('payload_json').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'synced' | 'failed'
  attemptsCount: integer('attempts_count').notNull().default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index('idx_outbox_status').on(table.status)
]);
