
import { startExamService, submitExamService } from '../src/server/examService.ts';
import { db } from '../src/db/index.ts';
import { students, attempts } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

/**
 * SIMULATED LOAD TEST FOR 45 STUDENTS
 * This script runs in the server context and calls service functions directly
 * to verify performance and consistency.
 */
async function runLoadTest() {
  console.log('--- STARTING LOAD TEST SIMULATION (45 STUDENTS) ---');
  
  // 1. Prepare 45 sample students in DB
  const sampleStudents = [];
  for (let i = 1; i <= 45; i++) {
    const id = `SIM${String(i).padStart(3, '0')}`;
    sampleStudents.push({
      studentId: id,
      fullName: `Student Simulation ${i}`,
      className: '11A_TEST',
      grade: 11,
      status: 'Chưa thi'
    });
  }

  console.log(`- Seeding ${sampleStudents.length} students...`);
  for (const s of sampleStudents) {
    await db.insert(students).values(s).onConflictDoNothing();
  }

  // 2. Simulate concurrent logins/starts
  console.log('- Simulating 45 concurrent exam starts...');
  const startStart = Date.now();
  const startPromises = sampleStudents.map(s => 
    startExamService({
      studentId: s.studentId,
      fullName: s.fullName,
      className: s.className,
      grade: s.grade,
      examCode: '101'
    })
  );

  const startResults = await Promise.all(startPromises);
  const startDuration = Date.now() - startStart;
  
  const startSuccess = startResults.filter(r => r.success).length;
  console.log(`  > Success: ${startSuccess}/45`);
  console.log(`  > Average Start Latency: ${Math.round(startDuration / 45)}ms`);

  // 3. Simulate submissions
  console.log('- Simulating 45 concurrent submissions...');
  const submitStart = Date.now();
  const submitPromises = startResults.map(r => {
    if (!r.success) return Promise.resolve(null);
    return submitExamService({
      attemptId: r.attemptId,
      examCode: '101',
      mcqAnswers: { '101_MCQ_1': 'A', '101_MCQ_2': 'B' }, // Minimal answers for test
      tfAnswers: {},
      leaveTabCount: 0,
      studentId: r.student?.studentId,
      fullName: r.student?.fullName,
      className: r.student?.className,
      grade: r.student?.grade
    });
  });

  const submitResults = await Promise.all(submitPromises);
  const submitDuration = Date.now() - submitStart;
  
  const submitSuccess = submitResults.filter(r => r?.success).length;
  console.log(`  > Success: ${submitSuccess}/45`);
  console.log(`  > Average Submit Latency: ${Math.round(submitDuration / 45)}ms`);

  // 4. Verify Database Integrity
  console.log('- Verifying database integrity...');
  const dbAttempts = await db.select().from(attempts).where(eq(attempts.className, '11A_TEST'));
  console.log(`  > Records in DB: ${dbAttempts.length}`);
  
  const submittedInDb = dbAttempts.filter(a => a.status === 'submitted').length;
  console.log(`  > Submitted Records: ${submittedInDb}`);

  if (submittedInDb === 45 && submitSuccess === 45) {
    console.log('--- LOAD TEST SIMULATION: PASSED ---');
  } else {
    console.log('--- LOAD TEST SIMULATION: FAILED (Data Mismatch) ---');
  }
}

runLoadTest().catch(console.error);
