import { db } from './src/db/index.ts';
import { exams, examQuestions, students, examSettings, teachers } from './src/db/schema.ts';
import { OFFICIAL_EXAMS_SECRET } from './src/server/official-exams-secret.ts';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('--- ĐANG BẮT ĐẦU SEED DỮ LIỆU ---');

  try {
    // 1. Seed Exam Settings
    console.log('[1/5] Khởi tạo Exam Settings...');
    await db.insert(examSettings).values({
      id: 1,
      academicYear: '2026-2027',
      schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
      examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
      subject: 'Tin học 11',
      durationMinutes: 45,
      isOpen: true,
      allowRetake: false,
      showScoreImmediately: false,
      showCorrectAnswersAfterSubmit: false,
      googleSheetWebAppUrl: 'https://script.google.com/macros/s/AKfycbxkJfIHGDafc0FdPpWMeMgpCJN8L4yt7hFwjmp-gGB7TRvuj6jqXsrJ1x2TzL6vOkVF/exec',
      googleSheetSecretKey: 'GIA_RAI_TIN12_SECURE_2026'
    }).onConflictDoNothing();

    // 2. Seed Teachers (Whitelist)
    console.log('[2/5] Khởi tạo danh sách giáo viên...');
    await db.insert(teachers).values([
      { email: 'lamle01012025@gmail.com', fullName: 'Lê Hùng Lâm', role: 'admin' },
      { email: 'admin@giarai.edu.vn', fullName: 'Quản trị viên Hệ thống', role: 'admin' }
    ]).onConflictDoNothing();

    // 3. Seed Exams
    console.log('[3/5] Khởi tạo đề thi...');
    for (const examData of OFFICIAL_EXAMS_SECRET) {
      await db.insert(exams).values({
        code: examData.code,
        title: examData.title,
        grade: examData.grade,
        subject: examData.subject,
        durationMinutes: examData.durationMinutes,
        totalPoints: examData.totalPoints,
        pdfUrl: examData.pdfUrl
      }).onConflictDoUpdate({
        target: exams.code,
        set: { 
          title: examData.title,
          durationMinutes: examData.durationMinutes 
        }
      });

      // 4. Seed Questions
      console.log(`     - Nạp câu hỏi cho mã đề ${examData.code}...`);
      
      // MCQ
      for (const q of examData.mcqQuestions) {
        await db.insert(examQuestions).values({
          id: q.id,
          examCode: examData.code,
          questionType: 'MCQ',
          questionNumber: q.number,
          context: q.text,
          topic: q.topic,
          optionsJson: q.options,
          correctAnswerJson: q.correctOption,
          points: q.points || 0.25
        }).onConflictDoUpdate({
          target: examQuestions.id,
          set: { context: q.text, optionsJson: q.options, correctAnswerJson: q.correctOption }
        });
      }

      // TF
      for (const q of examData.tfQuestions) {
        const correctAnswers: any = {};
        q.items.forEach(item => {
          correctAnswers[item.id] = item.correctValue;
        });

        await db.insert(examQuestions).values({
          id: q.id,
          examCode: examData.code,
          questionType: 'TF',
          questionNumber: q.number,
          context: q.context,
          topic: q.topic,
          itemsJson: q.items.map(i => ({ id: i.id, text: i.text })),
          correctAnswerJson: correctAnswers,
          points: 1.0 // Total points for Part II question
        }).onConflictDoUpdate({
          target: examQuestions.id,
          set: { context: q.context, itemsJson: q.items.map(i => ({ id: i.id, text: i.text })), correctAnswerJson: correctAnswers }
        });
      }
    }

    // 5. Seed Students
    console.log('[5/5] Khởi tạo danh sách học sinh...');
    const defaultPasscode = '123456';
    const salt = await bcrypt.genSalt(10);
    const passcodeHash = await bcrypt.hash(defaultPasscode, salt);

    const SAMPLE_STUDENTS = [
      { studentId: 'HS001', fullName: 'Nguyễn Văn A', className: '11A1', grade: 11 },
      { studentId: 'HS002', fullName: 'Lê Thị B', className: '11A1', grade: 11 },
      { studentId: 'HS003', fullName: 'Trần Văn C', className: '11A2', grade: 11 },
      { studentId: 'HS004', fullName: 'Phạm Thị D', className: '11A2', grade: 11 },
      { studentId: 'HS005', fullName: 'Hoàng Văn E', className: '11A3', grade: 11 }
    ];

    for (const s of SAMPLE_STUDENTS) {
      await db.insert(students).values({
        studentId: s.studentId,
        fullName: s.fullName,
        className: s.className,
        grade: s.grade || 11,
        passcodeHash: passcodeHash, // Default passcode for initial testing
        status: 'Chưa thi'
      }).onConflictDoNothing();
    }

    console.log('--- SEED DỮ LIỆU HOÀN TẤT ---');
    process.exit(0);
  } catch (err) {
    console.error('!!! LỖI SEED DỮ LIỆU:', err);
    process.exit(1);
  }
}

seed();
