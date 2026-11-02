import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db, isDbConfigured } from '../db/index.ts';
import { teachers, students, sessions, auditLogs } from '../db/schema.ts';
import { eq, and, gt } from 'drizzle-orm';

// In-memory fallback for rate-limiting student passcode attempts
const passcodeAttemptStore: Map<string, { attempts: number; lockUntil: number }> = new Map();

// Helper to check rate limit on student passcode
export function checkStudentRateLimit(studentId: string): { allowed: boolean; waitSeconds?: number } {
  const normId = studentId.trim().toUpperCase();
  const now = Date.now();
  const record = passcodeAttemptStore.get(normId);

  if (record && record.lockUntil > now) {
    const waitSec = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, waitSeconds: waitSec };
  }

  return { allowed: true };
}

export function recordPasscodeFailure(studentId: string) {
  const normId = studentId.trim().toUpperCase();
  const now = Date.now();
  const record = passcodeAttemptStore.get(normId) || { attempts: 0, lockUntil: 0 };
  
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockUntil = now + 5 * 60 * 1000; // Lock for 5 minutes after 5 failures
    record.attempts = 0;
  }
  passcodeAttemptStore.set(normId, record);
}

export function resetPasscodeFailure(studentId: string) {
  passcodeAttemptStore.delete(studentId.trim().toUpperCase());
}

/**
 * TEACHER GOOGLE OAUTH AUTHENTICATION
 */
export async function teacherGoogleAuth(idToken: string): Promise<{
  success: boolean;
  token?: string;
  email?: string;
  fullName?: string;
  error?: string;
}> {
  try {
    if (!idToken || typeof idToken !== 'string') {
      return { success: false, error: 'Thiếu Google ID token xác thực' };
    }

    // 1. Verify Google ID token strictly via Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    if (!decodedToken.email) {
      return { success: false, error: 'Tài khoản Google không cung cấp email' };
    }

    if (!decodedToken.email_verified) {
      return { success: false, error: 'Email Google chưa được xác minh (email_verified = false)' };
    }

    const email = decodedToken.email.toLowerCase().trim();
    const fullName = decodedToken.name || email.split('@')[0];

    // 2. Check teacher authorization in Database (or fallback allowed list)
    let isTeacherAuthorized = false;
    if (isDbConfigured()) {
      try {
        const teacherRows = await db.select().from(teachers).where(and(eq(teachers.email, email), eq(teachers.isActive, true)));
        if (teacherRows.length > 0) {
          isTeacherAuthorized = true;
        }
      } catch (err) {
        console.error('[authService] DB teacher query error:', err);
      }
    }

    // Fallback: If DB is empty or during first bootstrap, allow specified admin email or current applet user
    const allowedEnvEmails = (process.env.ALLOWED_TEACHER_EMAILS || 'lamle01012025@gmail.com,admin@giarai.edu.vn').split(',').map(e => e.trim().toLowerCase());
    if (!isTeacherAuthorized && (allowedEnvEmails.includes(email) || allowedEnvEmails.includes('*'))) {
      isTeacherAuthorized = true;
      // Auto-register teacher in DB if DB available
      if (isDbConfigured()) {
        try {
          await db.insert(teachers).values({
            email,
            fullName,
            role: 'admin',
            isActive: true
          }).onConflictDoNothing();
        } catch {}
      }
    }

    if (!isTeacherAuthorized) {
      return {
        success: false,
        error: `Email ${email} không có trong danh sách giáo viên được phép truy cập hệ thống.`
      };
    }

    // 3. Create server-side session in database
    const sessionToken = 'SESS_TCHR_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours valid

    if (isDbConfigured()) {
      try {
        await db.insert(sessions).values({
          id: sessionToken,
          userType: 'teacher',
          userId: email,
          emailOrStudentId: email,
          expiresAt
        });
      } catch (err) {
        console.error('[authService] Session save error:', err);
      }
    }

    return {
      success: true,
      token: sessionToken,
      email,
      fullName
    };
  } catch (err: any) {
    console.error('[authService.teacherGoogleAuth] Verification failed:', err);
    return {
      success: false,
      error: `Xác thực ID Token thất bại: ${err.message || 'Token không hợp lệ'}`
    };
  }
}

/**
 * VERIFY TEACHER SESSION TOKEN
 */
export async function verifyTeacherSession(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  if (isDbConfigured()) {
    try {
      const now = new Date();
      const rows = await db.select().from(sessions).where(
        and(
          eq(sessions.id, token),
          eq(sessions.userType, 'teacher'),
          gt(sessions.expiresAt, now)
        )
      );
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  return token.startsWith('SESS_TCHR_');
}

/**
 * REVOKE / LOGOUT TEACHER SESSION
 */
export async function revokeSession(token: string) {
  if (isDbConfigured() && token) {
    try {
      await db.delete(sessions).where(eq(sessions.id, token));
    } catch {}
  }
}

/**
 * STUDENT PASSCODE / IDENTITY AUTHENTICATION
 */
export async function verifyStudentIdentity(payload: {
  studentId: string;
  passcode?: string;
  fullName?: string;
  className?: string;
  grade?: number;
}): Promise<{
  success: boolean;
  student?: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    assignedCode?: string;
  };
  error?: string;
}> {
  const normId = payload.studentId.trim().toUpperCase();

  // Check rate limits
  const rateLimit = checkStudentRateLimit(normId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Bạn đã nhập sai mã quá 5 lần. Vui lòng thử lại sau ${rateLimit.waitSeconds} giây.`
    };
  }

  if (isDbConfigured()) {
    try {
      const studentRows = await db.select().from(students).where(eq(students.studentId, normId));
      if (studentRows.length === 0) {
        recordPasscodeFailure(normId);
        return {
          success: false,
          error: `Mã học sinh ${normId} không tồn tại trong danh sách kiểm tra chính thức.`
        };
      }

      const s = studentRows[0];

      // If passcode is set for student, verify passcode
      if (s.passcodeHash) {
        if (!payload.passcode) {
          return {
            success: false,
            error: 'Kỳ thi này yêu cầu Mã dự thi (Passcode). Vui lòng nhập mã được cấp.'
          };
        }
        
        const isMatch = await bcrypt.compare(payload.passcode.trim(), s.passcodeHash);
        if (!isMatch) {
          recordPasscodeFailure(normId);
          return {
            success: false,
            error: 'Mã dự thi (Passcode) không chính xác. Vui lòng kiểm tra lại thẻ thi.'
          };
        }
      }

      resetPasscodeFailure(normId);

      return {
        success: true,
        student: {
          studentId: s.studentId,
          fullName: s.fullName, // Server-verified, student cannot tamper
          className: s.className, // Server-verified
          grade: s.grade,
          assignedCode: s.assignedCode || undefined
        }
      };
    } catch (err: any) {
      console.error('[authService.verifyStudentIdentity] Error:', err);
    }
  }

  // Fallback if DB not seeded: accept input if provided cleanly
  if (payload.fullName && payload.className) {
    resetPasscodeFailure(normId);
    return {
      success: true,
      student: {
        studentId: normId,
        fullName: payload.fullName.trim(),
        className: payload.className.trim(),
        grade: payload.grade || 11
      }
    };
  }

  return {
    success: false,
    error: `Mã học sinh ${normId} chưa được đăng ký trong danh sách.`
  };
}
